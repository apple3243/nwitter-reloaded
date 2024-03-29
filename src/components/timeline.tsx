import { collection, getDocs, limit, onSnapshot, orderBy, query } from "@firebase/firestore";
import { Unsubscribe } from "@firebase/util";
import { useEffect, useState } from "react"
import styled from "styled-components";
import { db } from "../firebase";
import Tweet from "./tweet";

export interface ITweet {
    id : string;
    photo? : string;
    tweet : string;
    userId : string;
    username : string;
    createdAt : number
}

const Wrapper = styled.div`
    display: flex;
    gap : 10px;
    flex-direction : column;
    overflow-y : scroll;
`

export default function Timeline(){
    const [tweets, setTweets] = useState<ITweet[]>([]);
    useEffect(() => {
        let unsubscribe : Unsubscribe | null = null;
        const fetchTweets = async () => {
            const tweetsQuery = query(
                collection(db, "tweets"),
                orderBy("createdAt", "desc"),
                limit(5)
            );
            const snapshot = await getDocs(tweetsQuery);
            /* const tweets = snapshot.docs.map((doc) => {
                const {tweet, createdAt, userId, username, photo} = doc.data();
                return {
                    tweet, createdAt, userId, username, photo, id: doc.id
                }
            }) */
            // This will connect to eventListenr 
            const unsubscribe = await onSnapshot(tweetsQuery, (snapshot) => {
                const tweets = snapshot.docs.map((doc) => {
                    const {tweet, createdAt, userId, username, photo} = doc.data();
                    return {
                        tweet, createdAt, userId, username, photo, id: doc.id
                    }
                })
            setTweets(tweets)
            })
            
        }
        fetchTweets();
        //when the component is not in use, useEffect will do cleanup 
        return () => {
            unsubscribe && unsubscribe();
        }
    },[])
    return(
    <Wrapper>
        {tweets.map(tweet => <Tweet key={tweet.id} {...tweet}/>)}
    </Wrapper>
    )
}