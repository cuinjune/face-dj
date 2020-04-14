class ThreejsDraw {
    constructor(rendererWidth, rendererHeight, backgroundColor) {
        this.backgroundColor = backgroundColor;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, rendererWidth / rendererHeight, 0.001, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(rendererWidth, rendererHeight);
        this.renderer.setClearColor(backgroundColor);
        document.body.appendChild(this.renderer.domElement);
    }

    init() {
        const scene = this.scene;
        const camera = this.camera;
        const renderer = this.renderer;

        // camera
        camera.position.set(0, 0, 5);

        // lighting
        const light = new THREE.DirectionalLight(0xFFFFFF, 1);
        light.position.set(0, 0, 5);
        scene.add(light);

        // cube
        const texture = new THREE.TextureLoader().load("assets/images/texture.jpg");
        const geometry = new THREE.BoxGeometry(8, 8, 8);
        const material = new THREE.MeshStandardMaterial({ map: texture, side: THREE.BackSide });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(0, 0, 5);
        scene.add(cube);

        // events
        window.addEventListener("resize", () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        });
    }

    animate(time) {
        time *= 0.001; //convert to seconds
        this.renderer.render(this.scene, this.camera);
    }
}