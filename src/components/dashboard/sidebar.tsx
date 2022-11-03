import { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { Utils } from '../../utils';

import styles from '../../styles/Sidebar.module.scss';
import APIContext from '../../contexts/APIContext';
import { Dots } from '../dots';

export function DashboardSidebar() {
    const [opened, setOpen] = useState<boolean>(false);
    const { user, fetchUserGuilds } = useContext(APIContext);

    const router = useRouter();

    useEffect(() => {
        const serversMenu = document.querySelector(`.${styles.serversMenuWrapper}`) as HTMLElement;
        const profile = document.querySelector(`.${styles.profile}`) as HTMLElement;

        window.addEventListener('click', (e) => {
            if(opened && !serversMenu.contains(e.target as Node) && !profile.contains(e.target as Node)) {
                setOpen(false);
            }
        });

        if(opened && !user.guilds) {
            fetchUserGuilds();
        }
    });

    const openedProps = opened ? {'data-opened': true} : {}

    return (
        <nav className={styles.sidebar}>
            <header>
                <div className={styles.container}>
                    <div className={styles.profile} {...openedProps} onClick={() => setOpen(!opened)}>
                        <span className={styles.image}>
                            <img src={`https://cdn.discordapp.com/avatars/${user?.id}/${user?.avatar}.webp?size=2048`} alt={`@${user?.username}`} />
                        </span>

                        <div className={styles.text}>
                            <span className={styles.name}>{user?.username}</span>
                            <span className={styles.id}>{user?.id}</span>
                        </div>
                    </div>

                    <section className={styles.serversMenuWrapper} {...openedProps}>
                        <div className={styles.serversMenu}>
                            <ul>
                                <li data-selected>
                                    <Link href={'/dashboard/@me'}>
                                        <a>
                                            <div className={styles.server}>
                                                <span className={styles.image}>
                                                    <img src={`https://cdn.discordapp.com/avatars/${user?.id}/${user?.avatar}.webp?size=2048`} />
                                                </span>

                                                <span className={styles.text}>
                                                    <span className={styles.name}>{user?.username}</span>
                                                </span>
                                            </div>
                                        </a>
                                    </Link>  
                                </li>

                                <hr />

                                {user?.guilds?.map(guild => (
                                    <li key={guild.id}>
                                        <Link href={`/dashboard/guilds/${guild.id}`}>
                                            <a>
                                                <div className={styles.server}>
                                                    <span className={styles.image}>
                                                        { guild.icon ? <img src={Utils.getGuildIcon(guild, { size: 1024, dynamic: true })} /> : <div>{Utils.stringAcronym(guild.name)}</div> }
                                                    </span>

                                                    <span className={styles.text}>
                                                        <span className={styles.name}>{guild.name}</span>
                                                    </span>
                                                </div>
                                            </a>
                                        </Link>  
                                    </li>
                                )) ?? <Dots />}

                                <hr />

                                <li className={styles.invite}>
                                    <Link href={'/invite'}>
                                        <a>
                                            <div className={styles.server}>
                                                <span className={styles.image}>
                                                    <img src={'https://imgur.com/xCIgS2n.png'} style={{borderRadius: '0'}} />
                                                </span>

                                                <span className={styles.text}>
                                                    <span className={styles.name}>Invite</span>
                                                </span>
                                            </div>
                                        </a>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </section>
                </div>
            </header>

            <ul className={styles.links}>
                <div>
                    <li>
                        <span>General</span>
                    </li>
                    <li data-selected>
                        <Link href='#'>
                            <a>
                                <i className={`${router.pathname == '/' ? 'fa' : 'far'} fa-home`} />
                                <span>Dashboard</span>
                            </a>
                        </Link>
                    </li>
                </div>
            </ul>
        </nav>
    )
}