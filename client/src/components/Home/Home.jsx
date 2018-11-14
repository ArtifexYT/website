import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { Header } from 'semantic-ui-react';
import api from '../../api';

import BotCardSmall from "../common/BotCard/BotCardSmall";

import './Home.scss';

class Home extends Component {
    constructor(props) {
        super(props);
        this.bots = [];
        this.featuredBots= [];
    }
    
    async componentWillMount() {
        const res = await api.get('/bots');
        this.bots = res.data;

        // featured bots
        const featuredRes = await api.get('/bots/featured');
        this.featuredBots = featuredRes.data;
    }
    
    render() {
        return (
            <div className="page">
                <Helmet>
                    <title>Discordboats | Home</title>
                    
                    <meta property='og:title' content='Discordboats | Home' />
                    <meta property='og:url' content='https://discordboats.club/'/>
                    <meta property='og:site_name' content='discordboats.club' />
                    <meta property='og:type' content='website' />
                    <meta property='og:image' content='LOGO URL' />
                </Helmet>
                <Header as='h3'>Featured</Header>
                {this.featuredBots.map(bot => {<BotCardSmall bot={bot} />})}
                <hr />
                <Header as='h3'>All the Rest</Header>
                {this.bots.map(bot => {<BotCardSmall bot={bot} />})}
            </div>
        );
    }
}

Home.propTypes = {
    bots: PropTypes.array,
    featuredBots: PropTypes.array
};

export default Home;