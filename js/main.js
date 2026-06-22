"use strict";

/*******************************************************
 *    Asynchronotrigger - 100p
 *
 *    This is your last assignment. Finish this to proof that
 *    you are a grown up now, who doesn't need to be held by
 *    the hand.
 *
 *    Create a users-class. Fetch the users, create Instances.
 *    - https://jsonplaceholder.typicode.com/users
 *
 *    Create a posts-class. Fetch the posts. create Instances.
 *    Assign them to the users (see userId in the posts).
 *    - https://jsonplaceholder.typicode.com/posts
 *
 *    Print the shit. Beautifully:
 *    List the 10 users. On click, expand them with their posts.
 *    Each Post should also have a Button to "load comments".
 *    Yes, you are correct. This is the perfect usecase for
 *    event-delegation! You can get the comments to a post from either
 *    - https://jsonplaceholder.typicode.com/posts/1/comments
 *    or
 *    - https://jsonplaceholder.typicode.com/comments?postId=1
 *    where "1" stands for the posts ID of course.
 *
 *    I believe in...
 *    Srithi - 2026-06-22
 *  *******************************************************/

import { User } from './User.js';
import { Post } from './Post.js';

class App {
    constructor() {
        this.users = [];
        this.posts = [];
        this.commentsCache = new Map();
        this.init();
    }

    async init() {
        try {
            await this.fetchData();
            this.renderUsers();
            this.setupEventListeners();
        } catch (error) {
            console.error('Failed to initialize app:', error);
            document.body.innerHTML = `
                <div class="error-container">
                    <p>Failed to load data. Please try again later.</p>
                    <p>Error: ${error.message}</p>
                    <button onclick="location.reload()">Reload</button>
                </div>
            `;
        }
    }

    async fetchData() {
        try {
            const [usersResponse, postsResponse] = await Promise.all([
                fetch('https://jsonplaceholder.typicode.com/users'),
                fetch('https://jsonplaceholder.typicode.com/posts')
            ]);

            if (!usersResponse.ok || !postsResponse.ok) {
                throw new Error(`HTTP error! Status: ${usersResponse.status} / ${postsResponse.status}`);
            }

            const usersData = await usersResponse.json();
            const postsData = await postsResponse.json();

            // Create User instances
            this.users = usersData.map(userData => new User(userData));

            // Create Post instances and assign to users
            postsData.forEach(postData => {
                const post = new Post(postData);
                const user = this.users.find(u => u.id === postData.userId);
                if (user) {
                    user.addPost(post);
                }
            });

            console.log(`Loaded ${this.users.length} users and ${postsData.length} posts`);
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }

    renderUsers() {
        const container = document.getElementById('app') || document.body;

        // Clear existing content
        container.innerHTML = '';

        // Add header
        const header = document.createElement('div');
        header.className = 'app-header';
        header.innerHTML = `
            <h1>Asynchronotrigger</h1>
            <p class="subtitle">${this.users.length} Users with their posts</p>
        `;
        container.appendChild(header);

        // Create users wrapper
        const usersWrapper = document.createElement('div');
        usersWrapper.className = 'users-wrapper';
        container.appendChild(usersWrapper);

        // Render each user
        this.users.forEach(user => {
            const userElement = user.render();
            usersWrapper.appendChild(userElement);
        });
    }

    setupEventListeners() {
        // Event delegation for user clicks (expand/collapse posts)
        document.addEventListener('click', (event) => {
            const userHeader = event.target.closest('.user-header');
            if (userHeader) {
                const userDiv = userHeader.closest('.user');
                if (userDiv) {
                    this.toggleUserPosts(userDiv);
                }
            }
        });

        // Event delegation for load comments buttons
        document.addEventListener('click', async (event) => {
            const button = event.target.closest('.load-comments-btn');
            if (button) {
                const postDiv = button.closest('.post');
                if (postDiv) {
                    await this.loadCommentsForPost(postDiv);
                }
            }
        });
    }

    toggleUserPosts(userDiv) {
        const postsContainer = userDiv.querySelector('.posts-container');
        const toggleIcon = userDiv.querySelector('.toggle-icon');

        if (!postsContainer) return;

        const isExpanded = postsContainer.style.display !== 'none';

        if (isExpanded) {
            postsContainer.style.display = 'none';
            if (toggleIcon) toggleIcon.textContent = '▶';
        } else {
            postsContainer.style.display = 'block';
            if (toggleIcon) toggleIcon.textContent = '▼';
            this.renderUserPosts(userDiv);
        }
    }

    renderUserPosts(userDiv) {
        const userId = parseInt(userDiv.dataset.userId);
        const user = this.users.find(u => u.id === userId);
        const postsContainer = userDiv.querySelector('.posts-container');

        if (!user || !postsContainer) return;

        // If posts haven't been rendered yet
        if (postsContainer.children.length === 0) {
            if (user.posts.length > 0) {
                user.posts.forEach(post => {
                    const postElement = post.render();
                    postsContainer.appendChild(postElement);
                });
            } else {
                postsContainer.innerHTML = '<p class="no-posts">No posts available for this user.</p>';
            }
        }
    }

    async loadCommentsForPost(postDiv) {
        const postId = parseInt(postDiv.dataset.postId);
        const commentsContainer = postDiv.querySelector('.comments-container');
        const button = postDiv.querySelector('.load-comments-btn');

        if (!commentsContainer || !button) return;

        // Check if comments are already loaded and visible
        if (commentsContainer.style.display === 'block') {
            commentsContainer.style.display = 'none';
            button.textContent = 'Load Comments';
            return;
        }

        try {
            button.textContent = 'Loading...';
            button.disabled = true;

            // Check cache first
            let comments;
            if (this.commentsCache.has(postId)) {
                comments = this.commentsCache.get(postId);
            } else {
                const response = await fetch(
                    `https://jsonplaceholder.typicode.com/posts/${postId}/comments`
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch comments');
                }

                comments = await response.json();
                this.commentsCache.set(postId, comments);
                console.log(`Loaded ${comments.length} comments for post ${postId}`);
            }

            // Find the post and add comments
            let targetPost = null;
            for (const user of this.users) {
                const found = user.posts.find(p => p.id === postId);
                if (found) {
                    targetPost = found;
                    break;
                }
            }

            if (targetPost) {
                targetPost.addComments(comments);
            }

            // Render comments
            commentsContainer.innerHTML = '';
            if (comments.length === 0) {
                commentsContainer.innerHTML = '<p class="no-comments">No comments for this post.</p>';
            } else {
                const commentsList = document.createElement('div');
                commentsList.className = 'comments-list';

                comments.forEach(comment => {
                    const commentDiv = document.createElement('div');
                    commentDiv.className = 'comment';
                    commentDiv.innerHTML = `
                        <div class="comment-header">
                            <strong>${this.escapeHtml(comment.name)}</strong>
                            <span class="comment-email">(${this.escapeHtml(comment.email)})</span>
                        </div>
                        <p class="comment-body">${this.escapeHtml(comment.body)}</p>
                    `;
                    commentsList.appendChild(commentDiv);
                });

                commentsContainer.appendChild(commentsList);
            }

            commentsContainer.style.display = 'block';
            button.textContent = '💬 Hide Comments';
            button.disabled = false;

        } catch (error) {
            console.error('Failed to load comments:', error);
            button.textContent = '❌ Error';
            button.disabled = false;
            commentsContainer.innerHTML = `
                <p class="error-message">❌ Failed to load comments. Please try again.</p>
            `;
            commentsContainer.style.display = 'block';

            // Reset button after 3 seconds
            setTimeout(() => {
                button.textContent = '💬 Load Comments';
            }, 3000);
        }
    }

    // Helper to escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Start Asynchronotrigger');
    const app = new App();
});