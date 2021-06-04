import { Avatar, makeStyles } from "@material-ui/core";
import React, { useEffect, useRef, useState } from "react";
import { db } from "../firebase";
import firebase from "firebase";
import "./Post.css";
import { FavoriteRounded, FavoriteBorderRounded } from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    "& > *": {
      margin: theme.spacing(1),
    },
  },
  small: {
    width: theme.spacing(4.5),
    height: theme.spacing(4.5),
  },
}));

function Post({ id, username, imageUrl, caption, post, currUser }) {
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [liked, setLiked] = useState(false);
  const heartRef = useRef("");
  const [curLikes, setCurLikes] = useState([]);

  const likeRef = currUser
    ? db.collection("users").doc(currUser.displayName)
    : undefined;

  useEffect(() => {
    let unsubscribe;
    if (id) {
      unsubscribe = db
        .collection("posts")
        .doc(id)
        .collection("comments")
        .orderBy("timestamp")
        .onSnapshot((snapshot) =>
          setComments(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              comment: doc.data(),
            }))
          )
        );
    }
    return () => {
      unsubscribe();
    };
  }, [id]);
  

  useEffect(() => {
    let unsubscribe;
      unsubscribe = db.collection("posts")
      .doc(id).onSnapshot((snapshot) => {
        setCurLikes(snapshot.data().likes);
      });
    
    return () => {
        unsubscribe();
      
    };
  }, [id]);



  useEffect(() => {
    let unsubscribe;
    if (currUser) {
      unsubscribe = likeRef.onSnapshot((snapshot) => {
        setLiked(snapshot.data().likes.indexOf(id) > -1 ? true : false);
      });
    }
    return () => {
      if (currUser) {
        unsubscribe();
      }
    };
  }, [id, currUser]);

  const postComment = (e) => {
    e.preventDefault();

    db.collection("posts").doc(id).collection("comments").add({
      text: comment,
      username: currUser.displayName,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });

    setComment("");
  };

  let options = {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "numeric",
      second: "numeric",
    },
    formatter = new Intl.DateTimeFormat([], options);

  const date = formatter.format(
    new Date(post.timestamp ? post.timestamp.seconds * 1000 : 0)
  ); //.toISOString().slice(0, 19).replace('T', ' ')
  const el = heartRef.current;
  const handleLike = (e) => {
    if (!liked && currUser) {
      likeRef
        .update({
          likes: firebase.firestore.FieldValue.arrayUnion(id),
        })
        .then(() => console.log("liked ", id))
        .catch((err) => console.log(err));

      el.style.animation = "1s heartAnim ease-in-out";
      setTimeout(() => {
        el.style.animation = "none";
        el.style.transform = "scale(0)";
        db.collection("posts")
          .doc(id)
          .update({
            likes: firebase.firestore.FieldValue.arrayUnion(currUser.uid),
          })
          .then(() => console.log("add like to post ", id))
          .catch((err) => console.log(err));
      }, 1000);
    } else {
      if (liked && currUser) {
        likeRef
          .update({
            likes: firebase.firestore.FieldValue.arrayRemove(id),
          })
          .then(() => console.log("unliked ", id))
          .catch((err) => console.log(err));
        db.collection("posts")
          .doc(id)
          .update({
            likes: firebase.firestore.FieldValue.arrayRemove(currUser.uid),
          })
          .then(() => console.log("remove like to post ", id))
          .catch((err) => console.log(err));
      }
    }
  };
  const classes = useStyles();
  return (
    <div className="post" key={id}>
      <div className="post__header">
        <Avatar
          alt={username}
          src="/static/images/avatar/1.png"
          className={classes.small}
        />
        <h4>{username}</h4>
      </div>
      <div className="post__image" onDoubleClick={handleLike}>
        <img src={imageUrl} alt="" />
        <FavoriteRounded
          ref={heartRef}
          className="post__imageHeart"
          color="error"
        />
      </div>
      <div className="post__likes">
        {currUser && (
          <div className="post__likesButton">
            {liked ? (
              <FavoriteRounded onClick={handleLike} color="error" />
            ) : (
              <FavoriteBorderRounded onClick={handleLike} />
            )}
          </div>
        )}
        <div className="post__likesCount">
          <strong>{curLikes.length} like{curLikes.length === 1 ? '': 's'} </strong>
        </div>
      </div>
      <div className="post__text">
        {caption && (
          <p>
            <strong>{username}</strong> {caption}
          </p>
        )}
        <div className="post__comments">
          {comments.map(({ id, comment }) => (
            <p key={id}>
              <strong>{comment.username}</strong> {comment.text}
            </p>
          ))}
        </div>
        <form className="post__commentBox">
          <input
            className="post__input"
            type="text"
            placeholder="Enter comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button
            type="submit"
            disabled={!comment || !currUser}
            className="post__button"
            onClick={postComment}
          >
            Post
          </button>
        </form>

        <small>{date}</small>
      </div>
    </div>
  );
}

export default Post;
