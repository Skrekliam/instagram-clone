import { Avatar, makeStyles } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import firebase from "firebase";
import "./Post.css";

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
  useEffect(() => {
    let unsubscribe;
    if (id) {
      unsubscribe = db
        .collection("posts")
        .doc(id)
        .collection("comments")
        .orderBy('timestamp')
        .onSnapshot((snapshot) =>
          setComments(snapshot.docs.map((doc) => doc.data()))
        );
    }
    return () => {
      unsubscribe();
    };
  }, [id]);

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
      <img className="post__image" src={imageUrl} alt="" />
      <div className="post__text">
        <p>
          <strong>{username}</strong> {caption}
        </p>
        <div className="post__comments">
          {comments.map((el) => (
            <p>
              <strong>{el.username}</strong> {el.text}
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
