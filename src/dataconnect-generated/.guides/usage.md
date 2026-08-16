# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useGetUser, useListBooks, useCreateShelf, useAddShelfEntry, useUpdateReadingProgress, useUpdateUserBio, useDeleteShelfEntry } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useGetUser();

const { data, isPending, isSuccess, isError, error } = useListBooks();

const { data, isPending, isSuccess, isError, error } = useCreateShelf(createShelfVars);

const { data, isPending, isSuccess, isError, error } = useAddShelfEntry(addShelfEntryVars);

const { data, isPending, isSuccess, isError, error } = useUpdateReadingProgress(updateReadingProgressVars);

const { data, isPending, isSuccess, isError, error } = useUpdateUserBio(updateUserBioVars);

const { data, isPending, isSuccess, isError, error } = useDeleteShelfEntry(deleteShelfEntryVars);

```

Here's an example from a different generated SDK:

```ts
import { useListAllMovies } from '@dataconnect/generated/react';

function MyComponent() {
  const { isLoading, data, error } = useListAllMovies();
  if(isLoading) {
    return <div>Loading...</div>
  }
  if(error) {
    return <div> An Error Occurred: {error} </div>
  }
}

// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyComponent from './my-component';

function App() {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>
    <MyComponent />
  </QueryClientProvider>
}
```



## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { getUser, listBooks, createShelf, addShelfEntry, updateReadingProgress, updateUserBio, deleteShelfEntry } from '@dataconnect/generated';


// Operation GetUser: 
const { data } = await GetUser(dataConnect);

// Operation ListBooks: 
const { data } = await ListBooks(dataConnect);

// Operation CreateShelf:  For variables, look at type CreateShelfVars in ../index.d.ts
const { data } = await CreateShelf(dataConnect, createShelfVars);

// Operation AddShelfEntry:  For variables, look at type AddShelfEntryVars in ../index.d.ts
const { data } = await AddShelfEntry(dataConnect, addShelfEntryVars);

// Operation UpdateReadingProgress:  For variables, look at type UpdateReadingProgressVars in ../index.d.ts
const { data } = await UpdateReadingProgress(dataConnect, updateReadingProgressVars);

// Operation UpdateUserBio:  For variables, look at type UpdateUserBioVars in ../index.d.ts
const { data } = await UpdateUserBio(dataConnect, updateUserBioVars);

// Operation DeleteShelfEntry:  For variables, look at type DeleteShelfEntryVars in ../index.d.ts
const { data } = await DeleteShelfEntry(dataConnect, deleteShelfEntryVars);


```