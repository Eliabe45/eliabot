import fs from 'fs';
import path from 'path';
import { Contact } from '@open-wa/wa-automate';
import htmlToImage from 'node-html-to-image';

import { wordleDb } from '@json-db';
import { getRandom } from '@utils';
import { WordleSession } from 'src/database/models/wordle-session';
import { CONFIG } from 'config';

export class WordleGame {
  private id: Contact['id'];
  private session: WordleSession | null = null;
  private MAX_TRIES = 6;

  constructor(id: Contact['id']) {
    this.id = id;
  }

  private async loadSession(): Promise<void> {
    let session = await wordleDb.getFirst({
      id: this.id,
    });

    if (session === null) {
      session = {
        id: this.id,
        currentGame: {
          guessedLetters: [],
          guessedWords: [],
          tries: 0,
          word: '',
        },
        totalLosses: 0,
        totalWins: 0,
      };

      await wordleDb.save(session);
    }

    this.session = session;
  }

  private async updateSession() {
    await wordleDb.update({ id: this.session!.id }, this.session!);
  }

  private getRandomWord(): string {
    const words = fs.readFileSync(path.join(__dirname, 'words.txt'));
    const wordsArray = words.toString().split('\n');
    const randomWord = getRandom(wordsArray);
    return randomWord.replace('\r', '');
  }

  private async startNewGame(): Promise<void> {
    this.session!.currentGame = {
      guessedLetters: [],
      guessedWords: [],
      tries: 0,
      word: this.getRandomWord(),
    };
    await this.updateSession();
  }

  async play(word: string): Promise<{ gameImage: string; message: string }> {
    await this.loadSession();

    if (this.session!.currentGame.word === '') {
      await this.startNewGame();
    }

    const { currentGame, totalWins, id, totalLosses } = this.session!;

    this.session!.currentGame.tries += 1;
    this.session!.currentGame.guessedWords.push(word);

    if (!/^([A-Z]|[àáâãäåçèéêëìíîïðòóôõöùúûüýÿ])+$/i.test(word)) {
      this.session!.currentGame.tries -= 1;
      this.session!.currentGame.guessedWords.pop();
      return {
        gameImage: await this.getImage(),
        message: `${word} não é uma palavra válida.\nLetras inválidas: ${currentGame.guessedLetters.join(
          ', '
        )}`,
      };
    } else if (word.length !== 5) {
      this.session!.currentGame.tries -= 1;
      this.session!.currentGame.guessedWords.pop();
      return {
        gameImage: await this.getImage(),
        message: `${word} não é uma palavra válida pois não tem 5 caracteres.\nLetras inválidas: ${currentGame.guessedLetters.join(
          ', '
        )}`,
      };
    } else if (currentGame.word === word) {
      const gameImage = await this.getImage();
      this.session!.totalWins += 1;
      await this.startNewGame();
      return {
        gameImage,
        message: `Parabéns, você ganhou!\nVocê já jogou ${
          this.session!.totalWins + this.session!.totalLosses
        } vezes, ganhou ${this.session!.totalWins} e perdeu ${
          this.session!.totalLosses
        }.`,
      };
    } else if (currentGame.tries >= this.MAX_TRIES) {
      const returnData = {
        gameImage: await this.getImage(),
        message: "Você perdeu! A palavra era '" + currentGame.word + "'.",
      };
      this.session!.totalLosses += 1;
      await this.startNewGame();
      return returnData;
    }

    for (const letter of word) {
      if (
        !currentGame.guessedLetters.includes(letter) &&
        !currentGame.word.includes(letter)
      ) {
        this.session!.currentGame.guessedLetters.push(letter);
      }
    }

    await this.updateSession();

    return {
      gameImage: await this.getImage(),
      message: `Tentativa ${currentGame.tries}/${
        this.MAX_TRIES
      }\nLetras inválidas: ${currentGame.guessedLetters.join(', ')}`,
    };
  }

  async getImage(): Promise<string> {
    const {
      guessedWords,
      word: wordToBeGuessed,
      tries,
    } = this.session!.currentGame;

    const payload = [];
    for (let word of guessedWords) {
      let wordData: { letter: string; color: string }[] = [];

      for (let i = 0; i < word.length; i++) {
        const letter = word[i];
        const letterInfo = {
          letter,
          color: 'black',
        };

        if (letter === wordToBeGuessed[i]) {
          letterInfo.color = 'green';
        } else if (wordToBeGuessed.includes(letter)) {
          letterInfo.color = 'yellow';
        }

        wordData.push(letterInfo);
      }

      wordData = wordData.map((letter) => {
        if (
          letter.color === 'yellow' &&
          wordData.some(
            (l) => l.letter === letter.letter && l.color === 'green'
          )
        ) {
          letter.color = 'black';
        }
        return letter;
      });

      payload.push(wordData);
    }

    let htmlWithData = fs.readFileSync(
      path.join(__dirname, 'board.html'),
      'utf8'
    );

    htmlWithData = htmlWithData.replace(
      '{{WORD_DATA}}',
      `<script>const WORD_DATA=${JSON.stringify(payload)}</script>`
    );

    htmlWithData = htmlWithData.replace(
      '{{TRIES}}',
      `${tries}/${this.MAX_TRIES}`
    );

    const imagePath = `${CONFIG.screenshotsFolder}/${
      this.session!.id
    }-wordle.png`;
    await htmlToImage({
      output: imagePath,
      html: htmlWithData,
    });

    return imagePath;
  }
}
