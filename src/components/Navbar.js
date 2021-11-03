import React from 'react';
import Identicon from 'identicon.js';
import photo from '../photo.png';

function Navbar(props) {
  return (
    <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
      <a
        className="navbar-brand col-sm-3 col-md-2 mr-0"
        href="http://www.dappuniversity.com/bootcamp"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src={photo} width="30" height="30" className="d-inline-block align-top" alt="" />
        Dappinstagram
      </a>
      <ul className="navbar-nav px-3">
        <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
          {props.account ? (
            <>
              <small className="text-secondary">
                <small id="account">{props.account}</small>
              </small>
              <img
                className="ml-2"
                width="30"
                height="30"
                src={`data:image/png;base64,${new Identicon(props.account, 30).toString()}`}
                alt="profile img"
              />
            </>
          ) : (
            <button onClick={props.onSignIn}>Sign In</button>
          )}
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
