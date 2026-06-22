export class Post {
    constructor(postData) {
        this.id = postData.id;
        this.title = postData.title;
        this.body = postData.body;
        this.comments = [];
        this.commentsLoaded = false;
    }

    addComments(comments) {
        this.comments = comments;
        this.commentsLoaded = true;
    }

    render() {
        const postDiv = document.createElement('div');
        postDiv.className = 'post';
        postDiv.dataset.postId = this.id;

        // Truncate body if too long for display
        const displayBody = this.body.length > 150 ? this.body.substring(0, 150) + '...' : this.body;

        postDiv.innerHTML = `
            <h3>${this.title}</h3>
            <p>${displayBody}</p>
            <button class="load-comments-btn">💬 Load Comments</button>
            <div class="comments-container" style="display: none;"></div>
        `;

        return postDiv;
    }
}