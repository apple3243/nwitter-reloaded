import { styled } from "styled-components";
import { auth, db, storage } from "../firebase";
import { useEffect, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { collection, getDocs, limit, orderBy, query, where } from "@firebase/firestore";
import { ITweet } from "../components/timeline";
import Tweet from "../components/tweet";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 20px;
`;
const AvatarUpload = styled.label`
  width: 80px;
  overflow: hidden;
  height: 80px;
  border-radius: 50%;
  background-color: #1d9bf0;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  svg {
    width: 50px;
  }
`;

const AvatarImg = styled.img`
  width: 100%;
`;
const AvatarInput = styled.input`
  display: none;
`;
const Name = styled.span`
  font-size: 22px;
`;

const EditIcon = styled.button`
  width : 20px;
  height : 20px;
  padding: 0;
  background: black;
  border: none;
  cursor: pointer;
  svg{
    width : 100%;
    height: 100%;
    stroke: white;
  }
`

const Tweets = styled.div`
  display : flex;
  flex-direction : column;
  width: 100%;
  gap : 10px;
`

const NewName = styled.textarea`
  resize : none;
  height: 1.6rem;
`
const EditingArea = styled.div`
  
`

export default function Profile() {
    //it shows only users currently logged in
    const user = auth.currentUser;
    const [tweets, setTweets] = useState<ITweet[]>([]);
    const [avatar, setAvatar] = useState(user?.photoURL);
    const [edited, setEdited] = useState(false)
    const [newName, setNewname] = useState()
    const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const { files } = e.target;
      if (!user) return;
      if (files && files.length === 1) {
        const file = files[0];
        const locationRef = ref(storage, `avatars/${user?.uid}`);
        const result = await uploadBytes(locationRef, file);
        const avatarUrl = await getDownloadURL(result.ref);
        setAvatar(avatarUrl);
        await updateProfile(user, {
          photoURL: avatarUrl,
        });
      }
    };
    const fetchTweets = async () => {
      // firebase requires index 
      const tweetQuary = query(
        collection(db, "tweets"),
        where("userId", "==", user?.uid),
        orderBy("createdAt", "desc"),
        limit(25)
      );
      const snapshot = await getDocs(tweetQuary);
      const tweets = snapshot.docs.map(doc => {
        const {tweet, createdAt, userId, username, photo} = doc.data();
        return {
          tweet, createdAt, userId, username, photo, id: doc.id
        }
      })
      setTweets(tweets)
    }
    const editMode = () => {
      setEdited(check => !check)
    }
    const changeName = (e: React.ChangeEvent<HTMLSpanElement>) => {
      setNewname(e.target.value)
      console.log(newName)
    }
    const submitName = async (e: React.ChangeEvent<HTMLSpanElement>) => {
      e.preventDefault();
      const user = auth.currentUser;

      if (!user || newName === "" || edited == false) return;
      await updateProfile(user, {
        displayName : newName,
      });
      try{
        setEdited(false)
      }catch(e){
        console.log(e)
      }

    }
    useEffect(() => {
      fetchTweets();
    },[])
    return (
      <Wrapper>
        <AvatarUpload htmlFor="avatar">
          {avatar ? (
            <AvatarImg src={avatar} />
          ) : (
            <svg
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
            </svg>
          )}
        </AvatarUpload>
        <AvatarInput
          onChange={onAvatarChange}
          id="avatar"
          type="file"
          accept="image/*"
        />
        <Name>{user?.displayName ?? "Anonymous"}</Name>
        <EditingArea>
          {/* change the profile name */}
          { edited ? <NewName onChange={changeName} maxLength={10} placeholder={user.displayName}></NewName> : null}
          { <EditIcon onClick={edited ? submitName : editMode}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
        
          </EditIcon>}
        </EditingArea>
        <Tweets>
          {
            tweets.map(tweet => <Tweet key={tweet.id} {...tweet}/>)
          }
        </Tweets>
      </Wrapper>
    );
  }