import { createUserWithEmailAndPassword, updateProfile } from "@firebase/auth";
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
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {target : {name, value}} = e;
        if(name === "name"){
            setName(value);
        }else if (name === "email"){
            setEmail(value)
        }else if(name === "password"){
            setPassword(value)
        }
    }
    const onSubmit = async (e : React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        if(isLoading || name === "" || email === "" || password === "") return;
        try{
            setLoading(true)
            // create an account
            const credentials = await createUserWithEmailAndPassword(auth, email, password);
            console.log(credentials.user)
            await updateProfile(credentials.user, {
                displayName : name,
            });
            navigate("/")
            // set the name of the user
            // redirect to the home page
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
        <Title>Join 𝕏</Title>
        <Form onSubmit={onSubmit}>
            <Input onChange={onChange} name="name" value={name} placeholder="Name" type="text" required/>
            <Input onChange={onChange} name="email" value={email} placeholder="Email" type="email" required/>
            <Input onChange={onChange} name="password" value={password} placeholder="Password" type="password" required/>
            <Input type="submit" value={isLoading ? "Loading..." : "Create Account"}/>
        </Form>
        {error !== "" ? <Error>{error}</Error> : null}
        <Switcher>
            Already have an account? 
            <Link to="/login">Log in &rarr;</Link>
        </Switcher>
        <GithubButton/>
    </Wrapper>
}