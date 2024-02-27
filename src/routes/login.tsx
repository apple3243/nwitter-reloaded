import { signInWithEmailAndPassword } from "@firebase/auth";
import { FirebaseError } from "@firebase/util";
import * as React from "react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { Error, Form, Input, Switcher, Title, Wrapper } from "../components/auth-components";
import GithubButton from "../components/github-btn";
import { auth } from "../firebase";


export default function CreateAccount(){
    const navigate = useNavigate();
    const [isLoading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {target : {name, value}} = e;
        if (name === "email"){
            setEmail(value)
        }else if(name === "password"){
            setPassword(value)
        }
    }
    const onSubmit = async (e : React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        if(isLoading ||  email === "" || password === "") return;
        try{
            setLoading(true)
            await signInWithEmailAndPassword(auth, email, password);
            // redirect to the home page
            navigate("/")
        }catch(e){
            if(e instanceof FirebaseError){
                setError(e.message)
                // console.log(e.code, e.message) // You can check what is the code & message of FirebaseError
            }
            //seterror
        }finally{
            setLoading(false)
        }
        
        console.log(name, email, password)
    }
    return <Wrapper>
        <Title>Log into 𝕏</Title>
        <Form onSubmit={onSubmit}>
            <Input onChange={onChange} name="email" value={email} placeholder="Email" type="email" required/>
            <Input onChange={onChange} name="password" value={password} placeholder="Password" type="password" required/>
            <Input type="submit" value={isLoading ? "Loading..." : "Login"}/>
        </Form>
        {error !== "" ? <Error>{error}</Error> : null}
        <Switcher>
            Don't have an account? 
            <Link to="/create-account">Create one &rarr;</Link>
        </Switcher>
        <GithubButton/>
    </Wrapper>
}