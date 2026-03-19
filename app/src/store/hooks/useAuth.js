import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signIn as signInAction, signOut as signOutAction } from '../slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const client = useSelector((state) => state.auth.client);

  const signIn = useCallback(
    (clientData) => {
      dispatch(signInAction(clientData));
    },
    [dispatch]
  );

  const signOut = useCallback(() => {
    dispatch(signOutAction());
  }, [dispatch]);

  return { client, signIn, signOut };
};
