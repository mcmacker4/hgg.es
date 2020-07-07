import { h, render } from 'preact'

import "./style.scss"
import "./background"

function Application() {
    return (
        <div class="main">
            <p class="title">Hans Geel García</p>
            <p class="subtitle">Software Developer.</p>
        </div>
    )
}

render(<Application />, document.getElementById("content"))