import { deleteDoc, doc, updateDoc } from "@firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "@firebase/storage";
import { async } from "@firebase/util";
import { useState } from "react";
import styled from "styled-components";
import { auth, db, storage } from "../firebase";
import { ITweet } from "./timeline";

const Wrapper = styled.div`
    display : grid;
    grid-template-columns : 3fr 1fr;
    padding : 20px;
    border : 1px solid rgba(255,255,255,0.5);
    border-radius : 15px;
    + div{
        margin-top : 10px;
    }
`
const Column = styled.div`

`
const Photo = styled.img`
    width : 100px;
    height : 100px;
    border-radius : 15px;
`
const Username = styled.span`
    font-weight : 600;
    font-size : 15px;
`
const Payload = styled.p`
    margin : 10px 0px;
    font-size : 18px;
`

const DeleteBtn = styled.button`
    background-color: tomato;
    color: white;
    font-weight: 600;
    border : 0;
    font-size: 12px;
    padding : 5px 10px;
    text-transform: uppdercase;
    border-radius : 5px;
    cursor: pointer;
`;

const AttachEditedFileButton = styled.label`
  position: relative;
  left: 100%;
  align-content: end;
  background-color: seagreen;
  color: white;
  font-weight: 600;
  font-size: 12px;
  padding: 5px 10px;
  /* text-align: center; */
  border-radius: 5px;
  cursor: pointer;
`;
const AttachEditedFileInput = styled.input`
  display: none;
`;

const CancelBtn = styled(DeleteBtn)`
    
`

const EditingArea = styled.textarea`
    width : 80%;
    resize : none;
`

const EditBtn = styled.label`
    background-color: skyblue;
    color: #010101;
    font-weight: 600;
    border : 0;
    font-size: 12px;
    padding : 5px 10px;
    margin-left : 5px;
    text-transform: uppdercase;
    border-radius : 5px;
    cursor: pointer;
`;

const ConfirmBtn = styled(EditBtn)``

export default function Tweet({username, photo, tweet, userId, id } : ITweet){
    const user = auth.currentUser;
    const [editing, IsEditing] = useState(false);
    const [newTweet, setNewTweet] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const onDelete = async() => {
        const ok = confirm("Are you sure you want to delete this tweet?");
        if(!ok || user?.uid !== userId) return;
        try{
            await deleteDoc(doc(db, "tweets", id));
            if(photo){
                const photoRef = ref(storage, `tweets/${user.uid}/${id}`);
                await deleteObject(photoRef)
            }
        } catch(e){
            console.log(e);
        } finally {

        }
    }
    const onCancel = async() => {
        IsEditing(false)
    }
    const onConfirm = async() => {
        IsEditing(false)
        try{
            await updateDoc(doc(db, "tweets", id), {
                tweet: newTweet ? newTweet : tweet,
            });
            if (file) {
                const locationRef = ref(storage, `tweets/${user.uid}/${doc.id}`);
                const result = await uploadBytes(locationRef, file);
                const url = await getDownloadURL(result.ref);
                await updateDoc(doc(db, "tweets", id), {
                  photo: url,
                });
                // await deleteDoc(doc(db, "tweets", id));
        
                console.log(`photo: `, photo);
                setFile(null);
              }
        } catch(e){
            console.log(e)
        }
    }
    const onEditedFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // console.log(`file: ${file}`);
        const { files } = e?.target;
        if (files && files.length === 1) {
          setFile(files[0]);
        }
      };

    const onEdit = async(e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if(user?.uid !== userId) return;
        IsEditing(true);
        setNewTweet(e.target.value);
    }
    return (
    <Wrapper>
        <Column>
            <Username>{username}</Username>
            {
                editing && user?.uid === userId ? (<Payload>{<EditingArea maxLength={180} placeholder={tweet} value={newTweet} onChange={onEdit}></EditingArea>}</Payload>) 
                : (<Payload>{tweet}</Payload>)
            }    
            {
                editing && user?.uid === userId ? <CancelBtn onClick={onCancel}>Cancel</CancelBtn> : <DeleteBtn onClick={onDelete}>Delete</DeleteBtn> 
            }   
            {
                editing && user?.uid === userId ? <ConfirmBtn onClick={onConfirm}>Confirm</ConfirmBtn> : <EditBtn onClick={onEdit} htmlFor="file">Edit</EditBtn>
            }          
        </Column>
        <Column>{photo ? 
        <Photo src={photo}/>
         : null}</Column>
         <Column>
        {editing ? (
          <>
            <AttachEditedFileButton htmlFor="editfile">
              {file ? "Photo Added ✅" : "Add photo"}
            </AttachEditedFileButton>
            <AttachEditedFileInput
              onChange={onEditedFileChange}
              type="file"
              id="editfile"
              accept="image/*"
            />
          </>
        ) : null}
      </Column>
    </Wrapper>
    )
}