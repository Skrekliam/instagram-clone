import { Avatar, makeStyles } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { db } from "../firebase";
import Post from "./Post";
import "./Profile.css";

const useStyles = makeStyles((theme) => ({
  big: {
    width: theme.spacing(12),
    height: theme.spacing(12),
  },
}));

function Profile({ currUser }) {
  let { currId } = useParams();
  const [posts, setPosts] = useState([]);
  const [userData, setUserData] = useState([]);
  const classes = useStyles();

  useEffect(() => {
    db.collection("users")
      .doc(currId)
      .get()
      .then((docSnapshot) => {
        if (docSnapshot.exists) {
          setUserData(docSnapshot.data());
        } else {
          setUserData(false);
        }
      });
  }, []);

  useEffect(() => {
    if (userData.posts) {
      userData.posts.map((el) => {
        db.collection("posts")
          .doc(el)
          .get()
          .then((doc) => {
            
            // console.log(doc.data());
            setPosts(
              // (prevState) =>
              posts.push(doc.data())
              // prevState.concat(doc.data())
            );
            // console.log(posts);
          });
      });
    }

  }, [userData]);
  console.log(posts);

  // console.log(userData.posts);
  return (
    <div className="profile">
      {userData ? (
        <div className="profile__header">
          <div className="profile__headerAvatar">
            <Avatar
              alt={currId}
              src="/static/images/avatar/1.png"
              className={classes.big}
            />
          </div>

          <div className="profile__headerInfo">
            <div className="profile__headerName">
              <h1>{currId}</h1>
            </div>
            <div className="profile__headerData">
              <div className="profile__headerDataPostsCount">
                <strong>{userData.posts?.length}</strong> posts
              </div>
              <div className="profile__headerLikedPosts">
                <strong>{userData.likes?.length}</strong> liked posts
              </div>
            </div>
          </div>
{/* 
          <div className="profile__posts">
          {posts?.map(({ id, post }) => (
                  <Post
                    id={id}
                    key={id}
                    currUser={currUser}
                    // sec={post.timestamp? post.timestamp.seconds : 2}
                    username={post.username}
                    imageUrl={post.imageUrl}
                    caption={post.caption}
                    post={post}
                  />
                ))}
          </div> */}
        </div> 
      ) : (
        <h1>No user with this username</h1>
      )}
    </div>
  );
}

export default Profile;
