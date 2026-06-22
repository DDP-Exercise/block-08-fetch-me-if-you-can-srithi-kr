export class User {
    constructor(userData) {
        this.id = userData.id;
        this.name = userData.name;
        this.username = userData.username;
        this.email = userData.email;
        this.website = userData.website;
        this.posts = [];
    }

    addPost(post) {
        this.posts.push(post);
    }

    render() {
        const userDiv = document.createElement('div');
        userDiv.className = 'user';
        userDiv.dataset.userId = this.id;

        userDiv.innerHTML = `
            <div class="user-header">
                <div class="user-info">
                    <h2>${this.name}</h2>
                    <span class="username">@${this.username}</span>
                </div>
                <span class="toggle-icon">▶</span>
            </div>
            <div class="user-details">
                <a href="mailto:${this.email}">📧 ${this.email}</a>
                <a href="${this.website}" target="_blank">🌐 ${this.website}</a>
            </div>
            <div class="posts-container" style="display: none;"></div>
        `;

        return userDiv;
    }
}