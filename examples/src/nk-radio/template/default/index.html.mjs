export default () => {
return `
    <template>
    <div class="audio-newkind">
        <form class="audio-newkind__form">
            <input type="radio" class="audio-newkind__radio" id="raxxla" name="radio-selection" value="https://hermitage.hostingradio.ru/hermitage128.mp3" checked>
            <label for="raxxla"><span></span>Raxxla Radio</label>
            <input type="radio" class="audio-newkind__radio" id="earth" name="radio-selection" value="https://ice1.somafm.com/u80s-128-aac">
            <label for="earth"><span></span>Earth Radio</label>
            <input type="radio" class="audio-newkind__radio" id="cats-radio" name="radio-selection" value="https://ice1.somafm.com/deepspaceone-128-aac">
            <label for="cats-radio"><span></span>Cats Radio</label>
        </form>
        <canvas id="oscilloscope"></canvas>
        <button class="audio-newkind__btn" id="start">Start Audio</button>
    </div>
</template>`
}