export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Docs = {
  __typename?: "Docs";
  id: Scalars["String"];
  published: Scalars["Boolean"];
  text: Scalars["String"];
};

export type Mutation = {
  __typename?: "Mutation";
  createDocs?: Maybe<Docs>;
  deleteDocsById?: Maybe<Docs>;
  updateDocs?: Maybe<Docs>;
};

export type MutationDeleteDocsByIdArgs = {
  id: Scalars["String"];
};

export type MutationUpdateDocsArgs = {
  id: Scalars["String"];
  text: Scalars["String"];
};

export type Query = {
  __typename?: "Query";
  docs?: Maybe<Array<Maybe<Docs>>>;
  getDocsById?: Maybe<Docs>;
};

export type QueryGetDocsByIdArgs = {
  id: Scalars["String"];
};
