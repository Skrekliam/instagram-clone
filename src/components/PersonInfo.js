import { Avatar } from "@material-ui/core";
import React from "react";
import "./PersonInfo.css";

function PersonInfo({ currUser }) {
  if (!currUser) return <h1>Login to get data</h1>;
  return (
    <div className="person-info">
      <div className="person-info__picture">
        {currUser.photoUrl ? (
          <img src={currUser.photoUrl} alt={currUser.displayName} />
        ) : (
          <Avatar
            alt={currUser.displayName}
            src="/static/images/avatar/1.png"
          />
        )}
      </div>
      <div className="person-info__data">
        <p>
          {currUser.displayName}
          <br />
          {currUser.uid}
        </p>
      </div>
    </div>
  );
}

export default PersonInfo;
