import React from 'react';

const defaultAuthValue = {
  user: null,
  token: null,
  signIn: () => {},
  signOut: () => {},
};

export const AuthContext = React.createContext(defaultAuthValue);
