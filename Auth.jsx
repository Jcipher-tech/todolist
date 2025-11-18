```jsx
import React from 'react'
import { auth, provider } from '../firebase'
import { signInWithPopup, signOut } from 'firebase/auth'


export function Auth(){
const user = auth.currentUser


async function login(){
try{ await signInWithPopup(auth, provider); }catch(e){ console.error(e) }
}
async function logout(){ try{ await signOut(auth) }catch(e){} }


return (
<div>
{user ? (
<div className="flex items-center gap-2">
<img src={user.photoURL} alt="avatar" className="w-8 h-8 rounded-full" />
<button className="ghost px-3 py-1" onClick={logout}>Logout</button>
</div>
) : (
<button className="btn" onClick={login}>Sign in with Google</button>
)}
</div>
)
}
```