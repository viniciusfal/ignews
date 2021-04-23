import styles from './styles.module.scss';

import {SignInButtom} from '../SignInButtom';

export function Header() {
    return (
        <header className={styles.headerContainer}>
            <div className={styles.headerContent}>
                <img src="/images/logo.svg" alt="ignews"/>
                <nav>
                    <a className={styles.active}>Home</a>
                    <a >Posts</a>
                </nav>

                <SignInButtom />
            </div>
        </header>
    )
}