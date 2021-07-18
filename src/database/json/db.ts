import path from 'path';
import { FileReader } from './file-reader';

import { JsonDb } from './json-db';
import { BlockedUsers } from '../models/blocked-users';
import { BlockedGroups } from '../models/blocked-groups';
import { User } from '../models/user';
import { Group } from '../models/groups';
import { UserStats } from '../models/user-stats';
import { CONFIG } from '../../../config';

const dbFolder = path.join(CONFIG.dbFolder);
const usersDbJson = path.join(dbFolder, 'users.json');
const groupsDbJson = path.join(dbFolder, 'groups.json');
const blockedUsersDbJson = path.join(dbFolder, 'blocked-users.json');
const blockedGroupsDbJson = path.join(dbFolder, 'blocked-groups.json');
const userStatsDbJson = path.join(dbFolder, 'user-stats.json');

export const usersDb = new JsonDb<User>(
  usersDbJson,
  new FileReader(usersDbJson)
);

export const blockedUsersDb = new JsonDb<BlockedUsers>(
  blockedUsersDbJson,
  new FileReader(blockedUsersDbJson)
);

export const blockedGroupsDb = new JsonDb<BlockedGroups>(
  blockedGroupsDbJson,
  new FileReader(blockedGroupsDbJson)
);

export const groupsDb = new JsonDb<Group>(
  groupsDbJson,
  new FileReader(groupsDbJson)
);

export const userStatsDb = new JsonDb<UserStats>(
  userStatsDbJson,
  new FileReader(userStatsDbJson)
);
