import { Button, TextField } from "@material-ui/core";
import React, { useState } from "react";
import firebase from "firebase";
import { db, storage } from "../firebase";
import "./NewPost.css";

function NewPost({ currUser }) {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  console.log(image);
  const handleChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    const uploadTask = storage.ref(`images/${image.name}`).put(image);

    uploadTask.on(
      "state_change",
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgress(progress);
      },
      (error) => {
        console.log(error);
        setError(error);
      },
      () => {
        storage
          .ref("images")
          .child(image.name)
          .getDownloadURL()
          .then((url) => {
            db.collection("posts").add({
              timestamp: firebase.firestore.FieldValue.serverTimestamp(),
              caption: caption,
              imageUrl: url,
              username: currUser.displayName,
              likes:[]
            });
            db.collection("users")
            .doc(currUser.displayName)
            .update({
              posts: firebase.firestore.FieldValue.arrayUnion(currUser.uid),
            })
            .then(() => console.log("add post to user "))
            .catch((err) => console.log(err));
            
            setTimeout(() => {
              setProgress(0);
              setCaption("");
              setImage(null);
            }, 2500);
          });
      }
    );
  };

  if (!currUser) return "";

  return (
    <div
      className="newpost"
      style={{
        border: error
          ? "1px solid red"
          : !image
          ? "1px solid lightgray"
          : progress !== 100
          ? "1px solid orange"
          : "1px solid green",
      }}
    >
      <strong className="newpost__header-text">Upload new post</strong>
      <form className="newpost__form" noValidate autoComplete="off">
        <TextField
          id="standard-textarea"
          label="Caption"
          rowsMax={4}
          disabled={progress > 0}
          multiline
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        {/* <input type="file" accept="image/*" onChange={handleChange}/> */}

        <label htmlFor="raised-button-file" className="newpost__upload-btn">
          <Button variant="contained" component="span" disabled={progress > 0}>
            Select image
            <input
              accept="image/*"
              //   className={classes.input}
              style={{ display: "none" }}
              id="raised-button-file"
              multiple
              type="file"
              onChange={handleChange}
            />
          </Button>
        </label>
      </form>
      {image && (
        <div className="newpost__image-name">
          <span>File name: {image?.name}</span>
          <span>File size: {(image?.size / 1024 / 1000).toFixed(3)}MB</span>

          <div className="newpost__progress">
            <progress value={progress} max={100} />
            {progress}%
          </div>
          <Button
            disabled={progress>0}
            variant="contained"
            onClick={handleUpload}
            component="span"
          >
            Upload
          </Button>
        </div>
      )}       
    </div>
  );
}

export default NewPost;
