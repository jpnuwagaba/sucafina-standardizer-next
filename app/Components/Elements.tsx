import React from "react";
import Resizable from "./Resizable";
import Navbar from "./Navbar";

const Elements = () => {
    return (
        <div className="w-screen h-screen flex flex-col fixed top-0 left-0">
            <Navbar />
            <div className="flex-1 min-h-0">
                <Resizable />
            </div>
            
        </div>
    );
};

export default Elements;
