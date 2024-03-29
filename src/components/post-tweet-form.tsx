import { addDoc, collection, updateDoc } from "@firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "@firebase/storage";
import * as React from "react";
import { useState } from "react";
import styled from "styled-components"
import { auth, db, storage } from "../firebase";

const Form = styled.form`
    display : flex;
    flex-direction : column;
    gap: 10px;
`;

const TextArea = styled.textarea`
    border : 2px solid white;
    padding : 20px;
    border-radius : 20px;
    font-size : 16px;
    color: white;
    background-color : black;
    width: 100%;
    resize: none;
    font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Open Sans','Helvetica Neue',sans-serif;
    &::placeholder{
        font-size: 16px;
    }
    &:focus{
        outline: none;
        border-color : skyblue;
    }
`;
const AttachFileButton = styled.label`
    padding : 10px 0px;
    color: skyblue;
    text-align : center;
    border-radius: 20px;
    border : 1px solid skyblue;
    font-weight : 400;
    cursor: pointer;
`;
const AttachFileInput = styled.input`
    display : none;
`;
const SubmitBtn = styled.input`
    background-color : skyblue;
    color: white;
    border: none;
    padding : 10px 0px;
    border-radius: 20px;
    font-size: 16px;
    cursor: pointer;
    &:hover,&:active{
        opacity : 0.9
    }
`;

export default function PostTweetForm(){
    const [isLoading, setLoading] = useState(false)
    const [tweet, setTweet] = useState("");
    const [file, setFile] = useState<File|null>(null);
    const maxSize = 10 * 1024 * 1024;
    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTweet(e.target.value)
    };
    const onFileChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        const {files} = e.target;
        //This let users upload files only within 2MB
        if(files && files[0].size > maxSize ){
            alert("The uploaded file is too big");
            return;
        }
        //This let users upload only one file
        if(files && files.length === 1){
            setFile(files[0]);
        }
    }
    const onSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const user = auth.currentUser
        if (!user || isLoading || tweet === "" || tweet.length > 180) return;
        try{
            setLoading(true);
            const doc = await addDoc(collection(db, "tweets"), {
                tweet,
                createdAt : Date.now(),
                username : user.displayName || "Anonymous", 
                userId : user.uid,
            })
            if(file){
                const locationRef = ref(storage,`tweets/${user.uid}/${doc.id}`);
                const result = await uploadBytes(locationRef, file);
                const url = await getDownloadURL(result.ref);
                await updateDoc(doc, {
                    photo : url
                });
            }
            setTweet("")
            setFile(null)
        } catch (e) {
            console.log(e)
        } finally {
            setLoading(false)
        }
    }
    return <Form onSubmit={onSubmit}>
        <TextArea required rows={5} maxLength={180} onChange={onChange} value={tweet} placeholder="What is happening"/>
        <AttachFileButton htmlFor="file">{file ? "Photo added ✅":"Add Photo"}</AttachFileButton>
        <AttachFileInput onChange={onFileChange} id="file" type="file" accept="image/*" ref={ref}/>
        <SubmitBtn type="submit" value={isLoading ? "Posting...":"Post Tweet"}/>
    </Form>
}