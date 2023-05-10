import React, { lazy,Suspense } from 'react';
import { Link, Route, Routes } from "react-router-dom";
import { Button } from 'antd';
import { ConfigProvider } from 'antd';
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));

function App() {
    return (
        <div>
            <h1>App</h1>
            <Button type="primary">按钮</Button>
            <Link to="/home">Home</Link>
            <Link to="/about">About</Link>
            <Suspense fallback={<div>loading...</div>}>
                <Routes>
                    <Route path="/home" element={<Home />} />
                    <Route path="/about" element={<About />} />
                </Routes>
            </Suspense>
        </div>
    )
}
export default () => (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#00b96b',
        },
      }}
    >
      <App />
    </ConfigProvider>
  );
  
