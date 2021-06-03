import React from "react";
import "./Header.css";
import Button from "@material-ui/core/Button";
import { auth } from "../firebase";
import { Menu, MenuItem } from "@material-ui/core";
import Box from "@material-ui/core/Box";

function Header({ handleOpen, currUser }) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className="header">
      <img
        className="header__logo"
        src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
        alt="Instagram Logo"
      />
      <div className="header__buttons">
        {currUser ? (
          <>
            <Box display={{ xs: "block", md: "none", lg: "none" }}>
              <Button
                variant="outlined"
                aria-controls="simple-menu"
                aria-haspopup="true"
                onClick={handleClick}
              >
                {currUser.displayName} ⋮
              </Button>
              <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleClose}>Profile</MenuItem>
                <MenuItem onClick={handleClose}>My account</MenuItem>
                <MenuItem onClick={() => auth.signOut()}>Logout</MenuItem>
              </Menu>
            </Box>
            <Box display={{ xs: "none", md: "block", lg: "block" }}>
              <Button onClick={handleOpen.bind(this, "Register")}>
                Profile
              </Button>
              <Button onClick={handleOpen.bind(this, "Register")}>
                Messages
              </Button>
              <Button onClick={() => auth.signOut()}>Logout</Button>
            </Box>
          </>
        ) : (
          <>
            <Button onClick={handleOpen.bind(this, "Register")}>
              Register
            </Button>
            <Button onClick={handleOpen.bind(this, "LogIn")}>LogIn</Button>
          </>
        )}
      </div>
    </div>
  );
}

export default Header;
