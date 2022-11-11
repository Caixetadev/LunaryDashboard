import React, { createContext, useEffect, useState } from 'react';

import { User, UserWithGuilds, AbstractGuild, Guild } from '../@types';
import { createAPIClient } from '../services/ApiService';
import { ApolloError, gql, NetworkStatus, ServerError, ServerParseError } from '@apollo/client';
import { Client } from '../services/ClientService';
import { NetworkError } from '@apollo/client/errors';

interface APIContextData {
    signed: boolean;
    loading: boolean;
    user: UserWithGuilds;
    guild?: Guild;

    fetchGuild: (id: string) => Promise<Guild[]>;
    fetchUserGuilds: () => Promise<AbstractGuild[]>;
}

const APIContext = createContext<APIContextData>({} as APIContextData);

export class APIProvider extends React.Component<React.PropsWithChildren, {
    loading: boolean;
    user: UserWithGuilds;
    token: string;
    guild: Guild;
}> {
    public client = new Client();

    constructor(props: React.PropsWithChildren) {
        super(props);

        this.state = {
            loading: true,
            user: null,
            guild: null,
            token: null,
        }
    }

    componentDidMount(): void {
        const storagedToken = localStorage.getItem('auth_token');

        const loadUser = async() => {
            this.client.setToken(storagedToken);

            try {
                const { data, errors } = await this.client.api.query({
                    query: gql`
                        query User {
                            CurrentUser {
                                username
                                id
                                public_flags
                                avatar
                                discriminator
                            }
                        }
                    `,
                });
                
                if(errors?.length > 0) {
                    console.log(errors);
                    return errors;
                }
    
                if(data) {
                    this.setState({
                        user: { ...data.CurrentUser, guilds: null },
                        loading: false,
                        token: storagedToken,
                    });
                }
            } catch(error) {
                const err = (error as ApolloError).graphQLErrors[0] as any;

                if(err.status == 401) {
                    localStorage.removeItem('auth_token')
                    window.location.href = '/login';
                }

                console.log(err);
            }
        }

        if(storagedToken) {
            loadUser()
        } else if(window.location.pathname.startsWith('/dashboard')) {
            window.location.href = '/login';
        }
    }

    async fetchGuild(id: string) {
        const { data, errors } = await this.client.api.query({
            query: gql`
                query Guild($guild_id: String!) {
                    Guild(id: $guild_id) {
                        id
                        name
                        features
                        icon
                        owner_id
                        banner
                        channels {
                            id
                            type
                            createdAt
                            name
                            nsfw
                            parent_id
                            position
                        }
                        roles {
                            color
                            hoist
                            id
                            managed
                            mentionable
                            name
                            permissions
                            position
                        }
                    }
                }
            `,
            variables: {
                guild_id: id,
            },
        });

        const guild = data?.Guild as Guild;

        this.setState({ guild });

        return guild;
    }

    async fetchUserGuilds() {
        const { data, errors } = await this.client.api.query({
            query: gql`
                query UserGuilds($filter_guilds: Boolean) {
                    CurrentUserGuilds(filter: $filter_guilds) {
                        id
                        name
                        features
                        icon
                        owner
                        permissions
                    }
                }
            `,
            variables: {
                filter_guilds: true,
            }
        });

        const guilds = data.CurrentUserGuilds as AbstractGuild[];

        this.setState({
            user: { ...this.state.user, guilds },
        });

        return guilds;
    }

    render(): React.ReactNode {
        const { 
            props: { children },
            state: { loading, user },
            fetchUserGuilds,
            fetchGuild,
        } = this;

        return (
            <APIContext.Provider value={{
                signed: !!user, 
                loading, 
                user, 
                fetchUserGuilds: fetchUserGuilds.bind(this), 
                fetchGuild: fetchGuild.bind(this),
            }}>
                {children}
            </APIContext.Provider>
        )
    }
}

export default APIContext;