import { Box, Button, makeStyles, Modal, TextField } from "@material-ui/core";
import { useState, useEffect } from "react";
import "./App.css";
import Header from "./components/Header";
import Post from "./components/Post";
import { auth, db } from "./firebase.js";
import PersonInfo from "./components/PersonInfo";
import NewPost from "./components/NewPost";
import {
  HomeRounded,
  HomeOutlined,
  AddBoxRounded,
  AddBoxOutlined,
  MessageRounded,
  MessageOutlined,
} from "@material-ui/icons";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import Profile from "./components/Profile";

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: "absolute",
    maxWidth: 400,
    width: "80%",
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

function App() {
  const [posts, setPosts] = useState([]);
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState("Register");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState("");
  const [currUser, setCurrUser] = useState(null);
  const [activePage, setActivePage] = useState("Home");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        //user logged in
        // console.log(authUser);
        setCurrUser(authUser);
      } else {
        setCurrUser(null);
      }
    });
    return () => {
      unsubscribe();
    };
  }, [currUser, username]);

  useEffect(() => {
    db.collection("posts")
      .orderBy("timestamp", "desc")
      .onSnapshot((snapshot) => {
        setPosts(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            post: doc.data(),
          }))
        );
      });
  }, []);
  const handleOpen = (action) => {
    setOpen(true);
    setAction(action);
  };

  const classes = useStyles();
  const [modalStyle] = useState(getModalStyle);

  const formSubmit = (event) => {
    event.preventDefault();

    if (action === "Register") {
      db.collection("users")
        .doc(username)
        .get()
        .then((docSnapshot) => {
          if (docSnapshot.exists) {
            setErrors({ message: "Username already taken" });
          } else {
            auth
              .createUserWithEmailAndPassword(email, password)
              .then((authUser) => {
                setOpen(false);
                setErrors("");
                db.collection("users")
                  .doc(username)
                  .set({
                    uid: authUser.user.uid,
                    posts: [],
                    likes: [],
                  })
                  .then(() => {
                    console.log("Document successfully written!");
                  })
                  .catch((error) => {
                    console.error("Error writing document: ", error);
                  });
                return authUser.user.updateProfile({
                  displayName: username,
                });
              })
              .catch((err) => setErrors(err));
          }
        });
    } else {
      auth
        .signInWithEmailAndPassword(email, password)
        .then(() => {
          setOpen(false);
          setErrors("");
        })
        .catch((err) => setErrors(err));
    }
  };

  return (
    <div className="App">
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        className="modal"
      >
        <div style={modalStyle} className={classes.paper}>
          <form
            className={classes.root}
            noValidate
            autoComplete="off"
            onSubmit={formSubmit}
          >
            <center>
              <img
                className="modal__logo"
                src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
                alt="Instagram Logo"
              />
            </center>
            <div className="modal__fields">
              <TextField
                required
                id="email-required"
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {action == "Register" && (
                <TextField
                  required
                  id="usename-required"
                  label="Username"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value.replace(/[\W.]/g, ""))
                  }
                />
              )}
              <TextField
                required
                id="password-required"
                label="Password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors && <div className="modal__errors">{errors.message}</div>}
              <br />
              {action == "Register" ? (
                <Button type="submit" onClick={formSubmit}>
                  Register
                </Button>
              ) : (
                <Button type="submit" onClick={formSubmit}>
                  LogIn
                </Button>
              )}
            </div>
          </form>
        </div>
      </Modal>
      <Modal
        open={activePage === "AddBox"}
        onClose={() => setActivePage("Home")}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        className="modal"
      >
        <NewPost currUser={currUser} />
      </Modal>

      <Header handleOpen={handleOpen} currUser={currUser} />
      {/* start routing */}
      <Router>
        <Switch>
          <Route exact path="/">
            <div className="app__page">
              <div className="app__page__posts">
                {posts.map(({ id, post }) => (
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
              </div>
              <Box display={{ xs: "none", md: "block", lg: "block" }}>
                <div className="app__page__right-side">
                  {/* Right side ->   */}
                  {/* Profile pic + name + id  */}
                  <PersonInfo currUser={currUser} />
                  {window.innerWidth > 960 && (
                    <NewPost currUser={currUser} />
                  )}{" "}
                  {/* Add post */}
                </div>
              </Box>
            </div>

            {/* end routing */}
          </Route>
          <Route exact path="/:currId">
            <Profile currUser={currUser}/>
          </Route>
        </Switch>
      </Router>
      <Box display={{ xs: "block", md: "none", lg: "none" }}>
        <div className="app_bottom-menu">
          {/* home */}
          <div onClick={() => setActivePage("Home")}>
            {activePage === "Home" ? (
              <span>
                <HomeRounded fontSize="large" />
              </span>
            ) : (
              <span>
                <HomeOutlined fontSize="large" />
              </span>
            )}
          </div>
          {/* add post */}
          <div onClick={() => setActivePage("AddBox")}>
            {activePage === "AddBox" ? (
              <span>
                <AddBoxRounded fontSize="large" />
              </span>
            ) : (
              <span>
                <AddBoxOutlined fontSize="large" />
              </span>
            )}
          </div>
          {/* profile */}
          <div onClick={() => setActivePage("Message")}>
            {activePage === "Message" ? (
              <span>
                <MessageRounded fontSize="large" />
              </span>
            ) : (
              <span>
                <MessageOutlined fontSize="large" />
              </span>
            )}
          </div>
        </div>
      </Box>
    </div>
  );
}

export default App;
