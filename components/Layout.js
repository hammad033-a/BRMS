import React from 'react';
import { Container } from 'semantic-ui-react';
import Header from './header';
import Head from 'next/head';

// Enhanced layout with blockchain theme
export default props => {
    return (
        <div style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80")',
            backgroundSize: 'cover',
            backgroundAttachment: 'fixed',
            backgroundPosition: 'center',
            minHeight: '100vh',
            position: 'relative'
        }}>
            <div style={{
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1
            }}></div>
            
            <Container style={{ position: 'relative', zIndex: 2, paddingTop: '20px', paddingBottom: '40px' }}>
                <Head>
                    <title>Blockchain Review Platform</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <meta name="description" content="A decentralized platform for transparent and immutable product reviews" />
                    <link
                        rel="stylesheet"
                        href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css"
                    />
                    <style jsx global>{`
                        body {
                            margin: 0;
                            padding: 0;
                            font-family: 'Roboto', sans-serif;
                            color: #fff !important;
                            background: #181818 !important;
                        }
                        h1, h2, h3, h4, h5, h6 {
                            color: #ffffff;
                        }
                        .ui.card {
                            background-color: rgba(30, 30, 30, 0.8);
                            border: 1px solid rgba(255, 255, 255, 0.1);
                            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                        }
                        .ui.card .header {
                            color: #ffffff;
                        }
                        .ui.card .meta {
                            color: #4db8ff;
                        }
                        .ui.card .description {
                            color: #e0e0e0;
                        }
                        .ui.button {
                            background-color: #2185d0;
                            color: white;
                        }
                        .ui.button:hover {
                            background-color: #1678c2;
                        }
                        .ui.menu {
                            background-color: rgba(30, 30, 30, 0.9);
                            border: none;
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                        }
                        .ui.menu .item {
                            color: #f5f5f5;
                        }
                        .ui.menu .item:hover {
                            background-color: rgba(255, 255, 255, 0.1);
                        }
                        .ui.menu .active.item {
                            background-color: #2185d0;
                        }
                        .ui.segment, .ui.container, .ui.header, .ui.button, .ui.input, .ui.form, .ui.card, .ui.statistic, .ui.message, .ui.divider, .ui.grid, .ui.label, .ui.menu {
                            color: #fff !important;
                        }
                        a, a:visited, a:active {
                            color: #4db8ff !important;
                        }
                        .ui.button.primary, .ui.button.primary:focus {
                            background: #4db8ff !important;
                            color: #fff !important;
                        }
                        .ui.input input, .ui.form input, .ui.form textarea {
                            color: #fff !important;
                            background: rgba(255,255,255,0.08) !important;
                        }
                        
                        /* Custom animations for MetaMask login */
                        @keyframes pulse {
                            0% { transform: scale(1); }
                            50% { transform: scale(1.05); }
                            100% { transform: scale(1); }
                        }
                        
                        @keyframes fadeInUp {
                            from {
                                opacity: 0;
                                transform: translateY(30px);
                            }
                            to {
                                opacity: 1;
                                transform: translateY(0);
                            }
                        }
                        
                        @keyframes glow {
                            0% { box-shadow: 0 0 5px rgba(77, 184, 255, 0.5); }
                            50% { box-shadow: 0 0 20px rgba(77, 184, 255, 0.8); }
                            100% { box-shadow: 0 0 5px rgba(77, 184, 255, 0.5); }
                        }
                        
                        .metamask-button {
                            animation: pulse 2s infinite;
                        }
                        
                        .metamask-button:hover {
                            animation: glow 1s infinite;
                        }
                        
                        .fade-in-up {
                            animation: fadeInUp 0.6s ease-out;
                        }
                        
                        .success-glow {
                            animation: glow 2s infinite;
                        }
                    `}</style>
                </Head>

                <Header />
                {props.children}
            </Container>
        </div>
    );
};