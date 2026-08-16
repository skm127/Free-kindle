import { GetUserData, ListBooksData, CreateShelfData, CreateShelfVariables, AddShelfEntryData, AddShelfEntryVariables, UpdateReadingProgressData, UpdateReadingProgressVariables, UpdateUserBioData, UpdateUserBioVariables, DeleteShelfEntryData, DeleteShelfEntryVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useGetUser(options?: useDataConnectQueryOptions<GetUserData>): UseDataConnectQueryResult<GetUserData, undefined>;
export function useGetUser(dc: DataConnect, options?: useDataConnectQueryOptions<GetUserData>): UseDataConnectQueryResult<GetUserData, undefined>;

export function useListBooks(options?: useDataConnectQueryOptions<ListBooksData>): UseDataConnectQueryResult<ListBooksData, undefined>;
export function useListBooks(dc: DataConnect, options?: useDataConnectQueryOptions<ListBooksData>): UseDataConnectQueryResult<ListBooksData, undefined>;

export function useCreateShelf(options?: useDataConnectMutationOptions<CreateShelfData, FirebaseError, CreateShelfVariables>): UseDataConnectMutationResult<CreateShelfData, CreateShelfVariables>;
export function useCreateShelf(dc: DataConnect, options?: useDataConnectMutationOptions<CreateShelfData, FirebaseError, CreateShelfVariables>): UseDataConnectMutationResult<CreateShelfData, CreateShelfVariables>;

export function useAddShelfEntry(options?: useDataConnectMutationOptions<AddShelfEntryData, FirebaseError, AddShelfEntryVariables>): UseDataConnectMutationResult<AddShelfEntryData, AddShelfEntryVariables>;
export function useAddShelfEntry(dc: DataConnect, options?: useDataConnectMutationOptions<AddShelfEntryData, FirebaseError, AddShelfEntryVariables>): UseDataConnectMutationResult<AddShelfEntryData, AddShelfEntryVariables>;

export function useUpdateReadingProgress(options?: useDataConnectMutationOptions<UpdateReadingProgressData, FirebaseError, UpdateReadingProgressVariables>): UseDataConnectMutationResult<UpdateReadingProgressData, UpdateReadingProgressVariables>;
export function useUpdateReadingProgress(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateReadingProgressData, FirebaseError, UpdateReadingProgressVariables>): UseDataConnectMutationResult<UpdateReadingProgressData, UpdateReadingProgressVariables>;

export function useUpdateUserBio(options?: useDataConnectMutationOptions<UpdateUserBioData, FirebaseError, UpdateUserBioVariables>): UseDataConnectMutationResult<UpdateUserBioData, UpdateUserBioVariables>;
export function useUpdateUserBio(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateUserBioData, FirebaseError, UpdateUserBioVariables>): UseDataConnectMutationResult<UpdateUserBioData, UpdateUserBioVariables>;

export function useDeleteShelfEntry(options?: useDataConnectMutationOptions<DeleteShelfEntryData, FirebaseError, DeleteShelfEntryVariables>): UseDataConnectMutationResult<DeleteShelfEntryData, DeleteShelfEntryVariables>;
export function useDeleteShelfEntry(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteShelfEntryData, FirebaseError, DeleteShelfEntryVariables>): UseDataConnectMutationResult<DeleteShelfEntryData, DeleteShelfEntryVariables>;
