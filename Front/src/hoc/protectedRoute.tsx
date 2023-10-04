// import { useState } from "react";
import { Navigate } from "react-router-dom";
import jwt_decode from "jwt-decode";
import dayjs from "dayjs";
import Cookies from "js-cookie";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function PrivateRoute({ children }: { children: any }) {
  const token = Cookies.get("jwt") ? Cookies.get("jwt") : null;
  const user: { exp: number } | null = token ? jwt_decode(token!) : null;
  const isExpired =
    token && user ? dayjs.unix(user.exp).diff(dayjs()) < 1 : true;

  return !isExpired ? children : <Navigate to={"/login"} replace={true} />;
}
