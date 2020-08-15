import React from "react";
import { Link } from "react-router-dom";



const Home = () => {
    return (
        <div className="home-container">
            <div className="create-side">
                <Link className="btn" to="/create-room">Create Room</Link>
            </div>

            <div className="join-side">
                <Link className="btn" to="/join-room">Join Room</Link>
            </div>
        </div>
    );
}

export default Home;