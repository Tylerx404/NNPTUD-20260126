const API_URL = 'http://localhost:3000';

// ============ POSTS ============

async function getPosts() {
    const res = await fetch(`${API_URL}/posts`);
    return await res.json();
}

async function getMaxPostId() {
    const posts = await getPosts();
    if (posts.length === 0) return 0;
    const maxId = Math.max(...posts.map(p => parseInt(p.id) || 0));
    return maxId;
}

async function createPost() {
    const title = document.getElementById('postTitle').value;
    const views = parseInt(document.getElementById('postViews').value) || 0;
    const maxId = await getMaxPostId();
    const newId = (maxId + 1).toString();

    await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: newId, title, views, isDeleted: false })
    });
    loadPosts();
}

async function updatePost(id) {
    const title = prompt('New title:');
    if (!title) return;
    const views = parseInt(prompt('New views:')) || 0;

    await fetch(`${API_URL}/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, title, views, isDeleted: false })
    });
    loadPosts();
}

async function softDeletePost(id) {
    const post = await (await fetch(`${API_URL}/posts/${id}`)).json();
    await fetch(`${API_URL}/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...post, isDeleted: true })
    });
    loadPosts();
}

async function loadPosts() {
    const posts = await getPosts();
    const html = posts.map(p => `
        <div class="post ${p.isDeleted ? 'deleted' : ''}">
            <span>ID: ${p.id} - ${p.title} (Views: ${p.views})</span>
            ${!p.isDeleted ? `
                <button onclick="updatePost('${p.id}')">Edit</button>
                <button onclick="softDeletePost('${p.id}')">Delete</button>
            ` : '<span>[Deleted]</span>'}
        </div>
    `).join('');
    document.getElementById('posts').innerHTML = html;
}

// ============ COMMENTS ============

async function getComments() {
    const res = await fetch(`${API_URL}/comments`);
    return await res.json();
}

async function getMaxCommentId() {
    const comments = await getComments();
    if (comments.length === 0) return 0;
    const maxId = Math.max(...comments.map(c => parseInt(c.id) || 0));
    return maxId;
}

async function createComment() {
    const text = document.getElementById('commentText').value;
    const postId = document.getElementById('commentPostId').value;
    const maxId = await getMaxCommentId();
    const newId = (maxId + 1).toString();

    await fetch(`${API_URL}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: newId, text, postId })
    });
    loadComments();
}

async function updateComment(id) {
    const text = prompt('New comment text:');
    if (!text) return;
    const comment = await (await fetch(`${API_URL}/comments/${id}`)).json();

    await fetch(`${API_URL}/comments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, text, postId: comment.postId })
    });
    loadComments();
}

async function deleteComment(id) {
    await fetch(`${API_URL}/comments/${id}`, { method: 'DELETE' });
    loadComments();
}

async function loadComments() {
    const comments = await getComments();
    const html = comments.map(c => `
        <div class="comment">
            <span>ID: ${c.id} - ${c.text} (Post: ${c.postId})</span>
            <button onclick="updateComment('${c.id}')">Edit</button>
            <button onclick="deleteComment('${c.id}')">Delete</button>
        </div>
    `).join('');
    document.getElementById('comments').innerHTML = html;
}

// Load on startup
loadPosts();
loadComments();
