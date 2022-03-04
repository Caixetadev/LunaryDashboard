import React from 'react';
import Script from 'next/script';
import { GetServerSideProps } from 'next'
import socket from 'socket.io-client';
import { parseCookies } from 'nookies';

import LeftMenu from '../../../components/LeftMenu';
import LoadingPage from '../../../components/LoadingPage';
import Header from '../../../components/Header';

import styles from '../../../styles/main.module.css';
import userStyles from '../../../styles/user.module.css'; 

import { createState } from '../../../utils/states';

import { IUser } from '../../../types';

interface IState {
    user: IUser | null;
    loading: boolean;
};

interface IProps {
    theme: string;
    token: string;
    hostApi: string;
};

export default class DashboardMe extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user: null,
            loading: true,
        } as IState;
    }

    render() {
        const { user, loading } = this.state as IState;
        const { token, hostApi } = this.props as IProps;

        return (
            <>
                <LoadingPage {...{loading}} />
                <Header {...{user}}/>
                <LeftMenu {...{user}}/>

                <div className={`${styles['content']}`}>
                    <div className={`${userStyles['infoCard']}`}>
                        <i className="fal fa-moon" />
                        <div>
                            <h2>Luas</h2>
                            <h3>{user?.email || '...'}</h3>
                        </div>
                    </div>
                    <div className={`${userStyles['infoCard']}`}>
                        <i className="fad fa-angle-up" />
                        <div>
                            <h2>XP</h2>
                            <h3>{user?.email || '...'}</h3>
                        </div>
                    </div>
                    <div className={`${userStyles['infoCard']}`}>
                        <i className="far fa-hammer" />
                        <div>
                            <h2>Bans</h2>
                            <h3>{user?.email || '...'}</h3>
                        </div>
                    </div>
                    <div className={`${userStyles['infoCard']}`}>
                        <i className="fal fa-chart-line" />
                        <div>
                            <h2>Rank</h2>
                            <h3>{user?.email || '...'}</h3>
                        </div>
                    </div>
                </div>

                <Script
                    src='https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js'
                    onLoad={() => {
                        const api = socket(hostApi, {
                            query: {
                                token,
                            },
                        });

                        api.on('ready', ({ data }) => {
                            this.setState({
                                user: data.user,
                                loading: false,
                            });
                        });

                        api.on('error', ({ data }) => {
                            console.log(data);

                            if(!data?.message || `${data.message}`.toLowerCase().includes('token')) {
                                return window.location.href = '/api/auth/login?dt=true';
                            };
                        });
                    }}
                ></Script>
            </>
        );
    }
}

export const getServerSideProps: GetServerSideProps = async(ctx) => {
    const { ['__SessionLuny']: token } = parseCookies(ctx); 

    if(!token) return { 
        redirect: {
            destination: `/api/auth/login?state=${encodeURIComponent(ctx.req.url)}`,
            permanent: false,
        } 
    };

    return {
        props: {
            token,
            hostApi: process.env.HOST_API,
        },
    };
}