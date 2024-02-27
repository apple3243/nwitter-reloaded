import * as React from "react";
import { Navigate } from "react-router";
import { auth } from "../firebase";

export default function ProtectedRoute({children} : {children : React.ReactNode}){
    const user = auth.currentUser;
    if(user === null){
        return <Navigate to="/login"/>
    }
    return children
}