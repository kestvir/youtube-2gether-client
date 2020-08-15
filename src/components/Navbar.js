import React from "react";
import { Link } from "react-router-dom";


const Navbar = () => {
    return (
        <div className="navbar">
            <div className="app-name">
                <Link to="/">Youtube 2gether</Link>
            </div>
            <ul className="navbar-links">
                <li>
                    <Link to="/create-room">Create</Link>
                </li>
                <li>
                    <Link to="/join-room">Join</Link>
                </li>
            </ul>
        </div>
    );
}

export default Navbar;