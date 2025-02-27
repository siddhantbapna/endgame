const axios = require('axios');
const { createObjectCsvWriter } = require('csv-writer');

const GITHUB_API_URL = 'https://api.github.com';
const TOKEN = 'ghp_6z3sidkCCgHOeoWvICjpwPlvAqzXPSt45bIpE'; // Replace with your GitHub token

const usersCsvWriter = createObjectCsvWriter({
    path: 'users2.csv',
    header: [
        { id: 'login', title: 'login' },
        { id: 'name', title: 'name' },
        { id: 'company', title: 'company' },
        { id: 'location', title: 'location' },
        { id: 'email', title: 'email' },
        { id: 'hireable', title: 'hireable' },
        { id: 'bio', title: 'bio' },
        { id: 'public_repos', title: 'public_repos' },
        { id: 'followers', title: 'followers' },
        { id: 'following', title: 'following' },
        { id: 'created_at', title: 'created_at' },
    ],
});

const reposCsvWriter = createObjectCsvWriter({
    path: 'repositories.csv',
    header: [
        { id: 'login', title: 'login' },
        { id: 'full_name', title: 'full_name' },
        { id: 'created_at', title: 'created_at' },
        { id: 'stargazers_count', title: 'stargazers_count' },
        { id: 'watchers_count', title: 'watchers_count' },
        { id: 'language', title: 'language' },
        { id: 'has_projects', title: 'has_projects' },
        { id: 'has_wiki', title: 'has_wiki' },
        { id: 'license_name', title: 'license_name' },
    ],
});


async function fetusr(username) {
    dat = await fetch(`https://api.github.com/users/${username}`, {
        headers: { Authorization: `token ${TOKEN}` },
    })
    dat = await(dat.json())
    return dat
}



async function getUsersInBerlin() {
    let users = [];
    let url = `${GITHUB_API_URL}/search/users?q=location:Berlin+followers:>200&per_page=100`;

    while (url) {
        const response = await axios.get(url, {
            headers: { Authorization: `token ${TOKEN}` },
        });
        users = users.concat(response.data.items);

        const linkHeader = response.headers.link;
        if (linkHeader) {
            const links = linkHeader.split(',');
            url = links.find(link => link.includes('rel="next"'))?.match(/<(.+)>/)[1] || null;
        } else {
            url = null;
        }
    }


    for (var i = 0; i < users.length; i++) {
        
        user = await fetusr(users[i].login)
        console.log(i+1, users[i].login)
        users[i] = {
            login: user.login,
            name: user.name || '',
            company: user.company ? user.company.trim().replace(/^@/, '').toUpperCase() : '',
            location: user.location || '',
            email: user.email || '',
            hireable: user.hireable || false,
            bio: JSON.stringify(`${user.bio}` || ''),
            public_repos: user.public_repos || 0,
            followers: user.followers,
            following: user.following || 0,
            created_at: user.created_at,
        }
    }

    return users
}

async function getRepositoriesForUser(username) {

    lenn = 100
    repos = []
    cc = 1

    while(lenn == 100 && cc <= 5){

        dat = await fetch(`https://api.github.com/users/${username}/repos?per_page=500&sort=pushedpage=${cc}`, {
            headers: { Authorization: `token ${TOKEN}` },
        })
        dat = await(dat.json())
    
        for(var i = 0; i < dat.length; i++){
            repo = dat[i]
            repos.push({
                login: username,
                full_name: repo.full_name,
                created_at: repo.created_at,
                stargazers_count: repo.stargazers_count,
                watchers_count: repo.watchers_count,
                language: repo.language || '',
                has_projects: repo.has_projects || false,
                has_wiki: repo.has_wiki || false,
                license_name: repo.license ? repo.license.name : '',
            })
        }
        cc++;
        lenn = dat.length
    }

    

    return repos
}


async function fetchAllRepositories(users) {
    const allRepos = [];
    c = 0
    for (const user of users) {
        const repos = await getRepositoriesForUser(user);
        allRepos.push(...repos);
        console.log(c+1, user)
        c++
    }
    return allRepos;
}

(async () => {
    try {
        const users = await getUsersInBerlin();
        await usersCsvWriter.writeRecords(users);
        console.log('Users CSV written successfully');
        console.log(users.map(e => e.login))

        const allRepos = await fetchAllRepositories(users.map(e => e.login));
        await reposCsvWriter.writeRecords(allRepos);
        console.log('Repositories CSV written successfully');

    } catch (error) {
        console.error('Error fetching data:', error);
    }
})();
