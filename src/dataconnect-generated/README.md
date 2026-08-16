# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetUser*](#getuser)
  - [*ListBooks*](#listbooks)
- [**Mutations**](#mutations)
  - [*CreateShelf*](#createshelf)
  - [*AddShelfEntry*](#addshelfentry)
  - [*UpdateReadingProgress*](#updatereadingprogress)
  - [*UpdateUserBio*](#updateuserbio)
  - [*DeleteShelfEntry*](#deleteshelfentry)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetUser
You can execute the `GetUser` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getUser(options?: ExecuteQueryOptions): QueryPromise<GetUserData, undefined>;

interface GetUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetUserData, undefined>;
}
export const getUserRef: GetUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUser(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetUserData, undefined>;

interface GetUserRef {
  ...
  (dc: DataConnect): QueryRef<GetUserData, undefined>;
}
export const getUserRef: GetUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserRef:
```typescript
const name = getUserRef.operationName;
console.log(name);
```

### Variables
The `GetUser` query has no variables.
### Return Type
Recall that executing the `GetUser` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetUserData {
  user?: {
    username: string;
    email: string;
    avatarUrl?: string | null;
    bio?: string | null;
  };
}
```
### Using `GetUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUser } from '@dataconnect/generated';


// Call the `getUser()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUser(dataConnect);

console.log(data.user);

// Or, you can use the `Promise` API.
getUser().then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

### Using `GetUser`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserRef } from '@dataconnect/generated';


// Call the `getUserRef()` function to get a reference to the query.
const ref = getUserRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.user);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

## ListBooks
You can execute the `ListBooks` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listBooks(options?: ExecuteQueryOptions): QueryPromise<ListBooksData, undefined>;

interface ListBooksRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListBooksData, undefined>;
}
export const listBooksRef: ListBooksRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listBooks(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListBooksData, undefined>;

interface ListBooksRef {
  ...
  (dc: DataConnect): QueryRef<ListBooksData, undefined>;
}
export const listBooksRef: ListBooksRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listBooksRef:
```typescript
const name = listBooksRef.operationName;
console.log(name);
```

### Variables
The `ListBooks` query has no variables.
### Return Type
Recall that executing the `ListBooks` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListBooksData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListBooksData {
  books: ({
    title: string;
    author: string;
    genre: string;
  })[];
}
```
### Using `ListBooks`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listBooks } from '@dataconnect/generated';


// Call the `listBooks()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listBooks();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listBooks(dataConnect);

console.log(data.books);

// Or, you can use the `Promise` API.
listBooks().then((response) => {
  const data = response.data;
  console.log(data.books);
});
```

### Using `ListBooks`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listBooksRef } from '@dataconnect/generated';


// Call the `listBooksRef()` function to get a reference to the query.
const ref = listBooksRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listBooksRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.books);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.books);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateShelf
You can execute the `CreateShelf` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createShelf(vars: CreateShelfVariables): MutationPromise<CreateShelfData, CreateShelfVariables>;

interface CreateShelfRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateShelfVariables): MutationRef<CreateShelfData, CreateShelfVariables>;
}
export const createShelfRef: CreateShelfRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createShelf(dc: DataConnect, vars: CreateShelfVariables): MutationPromise<CreateShelfData, CreateShelfVariables>;

interface CreateShelfRef {
  ...
  (dc: DataConnect, vars: CreateShelfVariables): MutationRef<CreateShelfData, CreateShelfVariables>;
}
export const createShelfRef: CreateShelfRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createShelfRef:
```typescript
const name = createShelfRef.operationName;
console.log(name);
```

### Variables
The `CreateShelf` mutation requires an argument of type `CreateShelfVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateShelfVariables {
  name: string;
}
```
### Return Type
Recall that executing the `CreateShelf` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateShelfData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateShelfData {
  shelf_insert: Shelf_Key;
}
```
### Using `CreateShelf`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createShelf, CreateShelfVariables } from '@dataconnect/generated';

// The `CreateShelf` mutation requires an argument of type `CreateShelfVariables`:
const createShelfVars: CreateShelfVariables = {
  name: ..., 
};

// Call the `createShelf()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createShelf(createShelfVars);
// Variables can be defined inline as well.
const { data } = await createShelf({ name: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createShelf(dataConnect, createShelfVars);

console.log(data.shelf_insert);

// Or, you can use the `Promise` API.
createShelf(createShelfVars).then((response) => {
  const data = response.data;
  console.log(data.shelf_insert);
});
```

### Using `CreateShelf`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createShelfRef, CreateShelfVariables } from '@dataconnect/generated';

// The `CreateShelf` mutation requires an argument of type `CreateShelfVariables`:
const createShelfVars: CreateShelfVariables = {
  name: ..., 
};

// Call the `createShelfRef()` function to get a reference to the mutation.
const ref = createShelfRef(createShelfVars);
// Variables can be defined inline as well.
const ref = createShelfRef({ name: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createShelfRef(dataConnect, createShelfVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.shelf_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.shelf_insert);
});
```

## AddShelfEntry
You can execute the `AddShelfEntry` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
addShelfEntry(vars: AddShelfEntryVariables): MutationPromise<AddShelfEntryData, AddShelfEntryVariables>;

interface AddShelfEntryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddShelfEntryVariables): MutationRef<AddShelfEntryData, AddShelfEntryVariables>;
}
export const addShelfEntryRef: AddShelfEntryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
addShelfEntry(dc: DataConnect, vars: AddShelfEntryVariables): MutationPromise<AddShelfEntryData, AddShelfEntryVariables>;

interface AddShelfEntryRef {
  ...
  (dc: DataConnect, vars: AddShelfEntryVariables): MutationRef<AddShelfEntryData, AddShelfEntryVariables>;
}
export const addShelfEntryRef: AddShelfEntryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the addShelfEntryRef:
```typescript
const name = addShelfEntryRef.operationName;
console.log(name);
```

### Variables
The `AddShelfEntry` mutation requires an argument of type `AddShelfEntryVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface AddShelfEntryVariables {
  shelfId: UUIDString;
  bookId: UUIDString;
}
```
### Return Type
Recall that executing the `AddShelfEntry` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AddShelfEntryData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface AddShelfEntryData {
  shelfEntry_insert: ShelfEntry_Key;
}
```
### Using `AddShelfEntry`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, addShelfEntry, AddShelfEntryVariables } from '@dataconnect/generated';

// The `AddShelfEntry` mutation requires an argument of type `AddShelfEntryVariables`:
const addShelfEntryVars: AddShelfEntryVariables = {
  shelfId: ..., 
  bookId: ..., 
};

// Call the `addShelfEntry()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await addShelfEntry(addShelfEntryVars);
// Variables can be defined inline as well.
const { data } = await addShelfEntry({ shelfId: ..., bookId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await addShelfEntry(dataConnect, addShelfEntryVars);

console.log(data.shelfEntry_insert);

// Or, you can use the `Promise` API.
addShelfEntry(addShelfEntryVars).then((response) => {
  const data = response.data;
  console.log(data.shelfEntry_insert);
});
```

### Using `AddShelfEntry`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, addShelfEntryRef, AddShelfEntryVariables } from '@dataconnect/generated';

// The `AddShelfEntry` mutation requires an argument of type `AddShelfEntryVariables`:
const addShelfEntryVars: AddShelfEntryVariables = {
  shelfId: ..., 
  bookId: ..., 
};

// Call the `addShelfEntryRef()` function to get a reference to the mutation.
const ref = addShelfEntryRef(addShelfEntryVars);
// Variables can be defined inline as well.
const ref = addShelfEntryRef({ shelfId: ..., bookId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = addShelfEntryRef(dataConnect, addShelfEntryVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.shelfEntry_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.shelfEntry_insert);
});
```

## UpdateReadingProgress
You can execute the `UpdateReadingProgress` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateReadingProgress(vars: UpdateReadingProgressVariables): MutationPromise<UpdateReadingProgressData, UpdateReadingProgressVariables>;

interface UpdateReadingProgressRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateReadingProgressVariables): MutationRef<UpdateReadingProgressData, UpdateReadingProgressVariables>;
}
export const updateReadingProgressRef: UpdateReadingProgressRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateReadingProgress(dc: DataConnect, vars: UpdateReadingProgressVariables): MutationPromise<UpdateReadingProgressData, UpdateReadingProgressVariables>;

interface UpdateReadingProgressRef {
  ...
  (dc: DataConnect, vars: UpdateReadingProgressVariables): MutationRef<UpdateReadingProgressData, UpdateReadingProgressVariables>;
}
export const updateReadingProgressRef: UpdateReadingProgressRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateReadingProgressRef:
```typescript
const name = updateReadingProgressRef.operationName;
console.log(name);
```

### Variables
The `UpdateReadingProgress` mutation requires an argument of type `UpdateReadingProgressVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateReadingProgressVariables {
  bookId: UUIDString;
  page: number;
}
```
### Return Type
Recall that executing the `UpdateReadingProgress` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateReadingProgressData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateReadingProgressData {
  readingProgress_upsert: ReadingProgress_Key;
}
```
### Using `UpdateReadingProgress`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateReadingProgress, UpdateReadingProgressVariables } from '@dataconnect/generated';

// The `UpdateReadingProgress` mutation requires an argument of type `UpdateReadingProgressVariables`:
const updateReadingProgressVars: UpdateReadingProgressVariables = {
  bookId: ..., 
  page: ..., 
};

// Call the `updateReadingProgress()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateReadingProgress(updateReadingProgressVars);
// Variables can be defined inline as well.
const { data } = await updateReadingProgress({ bookId: ..., page: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateReadingProgress(dataConnect, updateReadingProgressVars);

console.log(data.readingProgress_upsert);

// Or, you can use the `Promise` API.
updateReadingProgress(updateReadingProgressVars).then((response) => {
  const data = response.data;
  console.log(data.readingProgress_upsert);
});
```

### Using `UpdateReadingProgress`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateReadingProgressRef, UpdateReadingProgressVariables } from '@dataconnect/generated';

// The `UpdateReadingProgress` mutation requires an argument of type `UpdateReadingProgressVariables`:
const updateReadingProgressVars: UpdateReadingProgressVariables = {
  bookId: ..., 
  page: ..., 
};

// Call the `updateReadingProgressRef()` function to get a reference to the mutation.
const ref = updateReadingProgressRef(updateReadingProgressVars);
// Variables can be defined inline as well.
const ref = updateReadingProgressRef({ bookId: ..., page: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateReadingProgressRef(dataConnect, updateReadingProgressVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.readingProgress_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.readingProgress_upsert);
});
```

## UpdateUserBio
You can execute the `UpdateUserBio` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateUserBio(vars: UpdateUserBioVariables): MutationPromise<UpdateUserBioData, UpdateUserBioVariables>;

interface UpdateUserBioRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateUserBioVariables): MutationRef<UpdateUserBioData, UpdateUserBioVariables>;
}
export const updateUserBioRef: UpdateUserBioRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateUserBio(dc: DataConnect, vars: UpdateUserBioVariables): MutationPromise<UpdateUserBioData, UpdateUserBioVariables>;

interface UpdateUserBioRef {
  ...
  (dc: DataConnect, vars: UpdateUserBioVariables): MutationRef<UpdateUserBioData, UpdateUserBioVariables>;
}
export const updateUserBioRef: UpdateUserBioRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateUserBioRef:
```typescript
const name = updateUserBioRef.operationName;
console.log(name);
```

### Variables
The `UpdateUserBio` mutation requires an argument of type `UpdateUserBioVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateUserBioVariables {
  bio: string;
}
```
### Return Type
Recall that executing the `UpdateUserBio` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateUserBioData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateUserBioData {
  user_update?: User_Key | null;
}
```
### Using `UpdateUserBio`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateUserBio, UpdateUserBioVariables } from '@dataconnect/generated';

// The `UpdateUserBio` mutation requires an argument of type `UpdateUserBioVariables`:
const updateUserBioVars: UpdateUserBioVariables = {
  bio: ..., 
};

// Call the `updateUserBio()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateUserBio(updateUserBioVars);
// Variables can be defined inline as well.
const { data } = await updateUserBio({ bio: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateUserBio(dataConnect, updateUserBioVars);

console.log(data.user_update);

// Or, you can use the `Promise` API.
updateUserBio(updateUserBioVars).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

### Using `UpdateUserBio`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateUserBioRef, UpdateUserBioVariables } from '@dataconnect/generated';

// The `UpdateUserBio` mutation requires an argument of type `UpdateUserBioVariables`:
const updateUserBioVars: UpdateUserBioVariables = {
  bio: ..., 
};

// Call the `updateUserBioRef()` function to get a reference to the mutation.
const ref = updateUserBioRef(updateUserBioVars);
// Variables can be defined inline as well.
const ref = updateUserBioRef({ bio: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateUserBioRef(dataConnect, updateUserBioVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

## DeleteShelfEntry
You can execute the `DeleteShelfEntry` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteShelfEntry(vars: DeleteShelfEntryVariables): MutationPromise<DeleteShelfEntryData, DeleteShelfEntryVariables>;

interface DeleteShelfEntryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteShelfEntryVariables): MutationRef<DeleteShelfEntryData, DeleteShelfEntryVariables>;
}
export const deleteShelfEntryRef: DeleteShelfEntryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteShelfEntry(dc: DataConnect, vars: DeleteShelfEntryVariables): MutationPromise<DeleteShelfEntryData, DeleteShelfEntryVariables>;

interface DeleteShelfEntryRef {
  ...
  (dc: DataConnect, vars: DeleteShelfEntryVariables): MutationRef<DeleteShelfEntryData, DeleteShelfEntryVariables>;
}
export const deleteShelfEntryRef: DeleteShelfEntryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteShelfEntryRef:
```typescript
const name = deleteShelfEntryRef.operationName;
console.log(name);
```

### Variables
The `DeleteShelfEntry` mutation requires an argument of type `DeleteShelfEntryVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteShelfEntryVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteShelfEntry` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteShelfEntryData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteShelfEntryData {
  shelfEntry_delete?: ShelfEntry_Key | null;
}
```
### Using `DeleteShelfEntry`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteShelfEntry, DeleteShelfEntryVariables } from '@dataconnect/generated';

// The `DeleteShelfEntry` mutation requires an argument of type `DeleteShelfEntryVariables`:
const deleteShelfEntryVars: DeleteShelfEntryVariables = {
  id: ..., 
};

// Call the `deleteShelfEntry()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteShelfEntry(deleteShelfEntryVars);
// Variables can be defined inline as well.
const { data } = await deleteShelfEntry({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteShelfEntry(dataConnect, deleteShelfEntryVars);

console.log(data.shelfEntry_delete);

// Or, you can use the `Promise` API.
deleteShelfEntry(deleteShelfEntryVars).then((response) => {
  const data = response.data;
  console.log(data.shelfEntry_delete);
});
```

### Using `DeleteShelfEntry`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteShelfEntryRef, DeleteShelfEntryVariables } from '@dataconnect/generated';

// The `DeleteShelfEntry` mutation requires an argument of type `DeleteShelfEntryVariables`:
const deleteShelfEntryVars: DeleteShelfEntryVariables = {
  id: ..., 
};

// Call the `deleteShelfEntryRef()` function to get a reference to the mutation.
const ref = deleteShelfEntryRef(deleteShelfEntryVars);
// Variables can be defined inline as well.
const ref = deleteShelfEntryRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteShelfEntryRef(dataConnect, deleteShelfEntryVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.shelfEntry_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.shelfEntry_delete);
});
```

