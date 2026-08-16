import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AddShelfEntryData {
  shelfEntry_insert: ShelfEntry_Key;
}

export interface AddShelfEntryVariables {
  shelfId: UUIDString;
  bookId: UUIDString;
}

export interface Book_Key {
  id: UUIDString;
  __typename?: 'Book_Key';
}

export interface CreateShelfData {
  shelf_insert: Shelf_Key;
}

export interface CreateShelfVariables {
  name: string;
}

export interface DeleteShelfEntryData {
  shelfEntry_delete?: ShelfEntry_Key | null;
}

export interface DeleteShelfEntryVariables {
  id: UUIDString;
}

export interface GetUserData {
  user?: {
    username: string;
    email: string;
    avatarUrl?: string | null;
    bio?: string | null;
  };
}

export interface ListBooksData {
  books: ({
    title: string;
    author: string;
    genre: string;
  })[];
}

export interface ReadingProgress_Key {
  id: UUIDString;
  __typename?: 'ReadingProgress_Key';
}

export interface ShelfEntry_Key {
  id: UUIDString;
  __typename?: 'ShelfEntry_Key';
}

export interface Shelf_Key {
  id: UUIDString;
  __typename?: 'Shelf_Key';
}

export interface UpdateReadingProgressData {
  readingProgress_upsert: ReadingProgress_Key;
}

export interface UpdateReadingProgressVariables {
  bookId: UUIDString;
  page: number;
}

export interface UpdateUserBioData {
  user_update?: User_Key | null;
}

export interface UpdateUserBioVariables {
  bio: string;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface GetUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetUserData, undefined>;
  operationName: string;
}
export const getUserRef: GetUserRef;

export function getUser(options?: ExecuteQueryOptions): QueryPromise<GetUserData, undefined>;
export function getUser(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetUserData, undefined>;

interface ListBooksRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListBooksData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListBooksData, undefined>;
  operationName: string;
}
export const listBooksRef: ListBooksRef;

export function listBooks(options?: ExecuteQueryOptions): QueryPromise<ListBooksData, undefined>;
export function listBooks(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListBooksData, undefined>;

interface CreateShelfRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateShelfVariables): MutationRef<CreateShelfData, CreateShelfVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateShelfVariables): MutationRef<CreateShelfData, CreateShelfVariables>;
  operationName: string;
}
export const createShelfRef: CreateShelfRef;

export function createShelf(vars: CreateShelfVariables): MutationPromise<CreateShelfData, CreateShelfVariables>;
export function createShelf(dc: DataConnect, vars: CreateShelfVariables): MutationPromise<CreateShelfData, CreateShelfVariables>;

interface AddShelfEntryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddShelfEntryVariables): MutationRef<AddShelfEntryData, AddShelfEntryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AddShelfEntryVariables): MutationRef<AddShelfEntryData, AddShelfEntryVariables>;
  operationName: string;
}
export const addShelfEntryRef: AddShelfEntryRef;

export function addShelfEntry(vars: AddShelfEntryVariables): MutationPromise<AddShelfEntryData, AddShelfEntryVariables>;
export function addShelfEntry(dc: DataConnect, vars: AddShelfEntryVariables): MutationPromise<AddShelfEntryData, AddShelfEntryVariables>;

interface UpdateReadingProgressRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateReadingProgressVariables): MutationRef<UpdateReadingProgressData, UpdateReadingProgressVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateReadingProgressVariables): MutationRef<UpdateReadingProgressData, UpdateReadingProgressVariables>;
  operationName: string;
}
export const updateReadingProgressRef: UpdateReadingProgressRef;

export function updateReadingProgress(vars: UpdateReadingProgressVariables): MutationPromise<UpdateReadingProgressData, UpdateReadingProgressVariables>;
export function updateReadingProgress(dc: DataConnect, vars: UpdateReadingProgressVariables): MutationPromise<UpdateReadingProgressData, UpdateReadingProgressVariables>;

interface UpdateUserBioRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateUserBioVariables): MutationRef<UpdateUserBioData, UpdateUserBioVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateUserBioVariables): MutationRef<UpdateUserBioData, UpdateUserBioVariables>;
  operationName: string;
}
export const updateUserBioRef: UpdateUserBioRef;

export function updateUserBio(vars: UpdateUserBioVariables): MutationPromise<UpdateUserBioData, UpdateUserBioVariables>;
export function updateUserBio(dc: DataConnect, vars: UpdateUserBioVariables): MutationPromise<UpdateUserBioData, UpdateUserBioVariables>;

interface DeleteShelfEntryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteShelfEntryVariables): MutationRef<DeleteShelfEntryData, DeleteShelfEntryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteShelfEntryVariables): MutationRef<DeleteShelfEntryData, DeleteShelfEntryVariables>;
  operationName: string;
}
export const deleteShelfEntryRef: DeleteShelfEntryRef;

export function deleteShelfEntry(vars: DeleteShelfEntryVariables): MutationPromise<DeleteShelfEntryData, DeleteShelfEntryVariables>;
export function deleteShelfEntry(dc: DataConnect, vars: DeleteShelfEntryVariables): MutationPromise<DeleteShelfEntryData, DeleteShelfEntryVariables>;

