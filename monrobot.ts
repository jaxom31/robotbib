

/**
 * Custom graphic block
 */
//% weight=100 color=#0fbc11 icon="\uf067" block="MonRobot"
namespace monrobot {

    //Motor selection enumeration
    export enum EnumerationMoteur {
        //% block="moteur gauche"
        MoteurGauche,
        //% block="moteur droite"
        MoteurDroit,
        //% block="deux moteurs"
        TouslesMoteurs,
    };

    //Motor direction enumeration selection
    export enum LesDirections {
        //% block="en avant"
        EnAvant,
        //% block="en arrière"
        EnArriere,
    };

    //LED light selection enumeration
    export enum LED {
        //% block="LED gauche"
        LedGauche,
        //% block="LED droite"
        LedDroite,
        //% block="deux LEDs"
        ToutesLed,
    };

    //LED light switch enumeration selection
    export enum MyEnumSwitch {
        //% block="éteint"
        Close,
        //% block="allumé"
        Open,
    };

    //Line sensor selection
    export enum MyEnumLineSensor {
        //% block="L1"
        SensorL1,
        //% block="M"
        SensorM,
        //% block="R1"
        SensorR1,
        //% block="L2"
        SensorL2,
        //% block="R2"
        SensorR2,
    };
    /**
     * Well known colors for a NeoPixel strip
     */
    export enum NeoPixelColors {
        //% block=rouge
        Red = 0xFF0000,
        //% block=orange
        Orange = 0xFFA500,
        //% block=jaune
        Yellow = 0xFFFF00,
        //% block=vert
        Green = 0x00FF00,
        //% block=bleu
        Blue = 0x0000FF,
        //% block=indigo
        Indigo = 0x4b0082,
        //% block=violet
        Violet = 0x8a2be2,
        //% block=mauve
        Purple = 0xFF00FF,
        //% block=blanc
        White = 0xFFFFFF,
        //% block=noir
        Black = 0x000000
    }

    const ADRESSEI2C = 0x10;
    const ADC0_REGISTER = 0X1E;
    const ADC1_REGISTER = 0X20;
    const LIRE_CODEUR_DROIT = 0X06 ;
    const LIRE_CODEUR_GAUCHE = 0X04;
    const ADC2_REGISTER = 0X22;
    const ADC3_REGISTER = 0X24;
    const ADC4_REGISTER = 0X26;
    const LEFT_LED_REGISTER = 0X0B;
    const RIGHT_LED_REGISTER = 0X0C;
    const LEFT_MOTOR_REGISTER = 0X00;
    const RIGHT_MOTOR_REGISTER = 0X02;
    const LINE_STATE_REGISTER = 0X1D;
    const VERSION_CNT_REGISTER = 0X32;
    const VERSION_DATA_REGISTER = 0X33;

    let irstate: number;
    let neopixel_buf = pins.createBuffer(16 * 3);
    for (let i = 0; i < 16 * 3; i++) {
        neopixel_buf[i] = 0
    }
    let _brightness = 255
    let state: number;

    /**
       * tourneADroite
       * @param duree number
       * @param vitesse number
       */

    //% block="Tourne à droite pendant %duree ms avec une  vitesse: %vitesse"
    //% weight=96
    export function tourneADroite(duree:number,vitesse:number) {
        monrobot.controlMotorStop(EnumerationMoteur.TouslesMoteurs) ;
        monrobot.activeLesmoteurs(LesDirections.EnAvant, vitesse, LesDirections.EnArriere,vitesse) ;
        basic.pause(duree) ;

    }
    /**
        * tourneAGauche
        * @param duree number
        * @param vitesse number
        */
    //% block="Tourne à gauche pendant %duree ms avec une  vitesse: %vitesse"
    //% weight=96
    export function tourneAGauche(duree: number, vitesse: number) {
        monrobot.controlMotorStop(EnumerationMoteur.TouslesMoteurs);
        monrobot.activeLesmoteurs(LesDirections.EnArriere, vitesse, LesDirections.EnAvant, vitesse);
        basic.pause(duree);

    }

    /**
       * Nombre de tours de roue droite
       * 
       */

    //% block="Nombre de tours moteur droit"
    //% weight=96
    export function lireCodeurDroit(): string {
        pins.i2cWriteNumber(ADRESSEI2C, LIRE_CODEUR_DROIT, NumberFormat.Int8LE);
        let data = pins.i2cReadNumber(ADRESSEI2C, NumberFormat.Int8LE);
        return data.toString() ;
    }

    /**
       * Nombre de tours de roue gauche
       * 
       */

    //% block="Nombre de tours moteur gauche"
    //% weight=96
    export function lireCodeurGauche(): string {
        pins.i2cWriteNumber(ADRESSEI2C, LIRE_CODEUR_GAUCHE, NumberFormat.Int8LE);
        let data = pins.i2cReadNumber(ADRESSEI2C, NumberFormat.Int8LE);
        return data.toString();
    }

    /**
     *  Init I2C until success
     */

    //% weight=100
    //%block="initialiser le Maqueen"
    export function initialiseRobot(): void {
        let Version_v = 0;
        pins.i2cWriteNumber(ADRESSEI2C, 0x32, NumberFormat.Int8LE);
        Version_v = pins.i2cReadNumber(ADRESSEI2C, NumberFormat.Int8LE);
        while (Version_v == 0) {
            basic.showLeds(`
                # . . . #
                . # . # .
                . . # . .
                . # . # .
                # . . . #
                `, 10)
            basic.pause(500)
            basic.clearScreen()
            pins.i2cWriteNumber(0x10, 0x32, NumberFormat.Int8LE);
            Version_v = pins.i2cReadNumber(ADRESSEI2C, NumberFormat.Int8LE);
        }
        basic.showLeds(`
                . . . . .
                . . . . #
                . . . # .
                # . # . .
                . # . . .
                `, 10)
        basic.pause(500)
        basic.clearScreen()
    }
    /**
     * Active les deux moteurs d'un coup
     * @param directiond moteur droit Enumeration direction
     * @param vitessed vitesse du moteur droit
     * @param directiong moteur gauche Enumeration direction
     *  @param vitesseg vitesse du moteur gauche
     */

    //% block="activer le moteur droit vers %directiond vitesse %vitessed et le moteur gauche vers %directiong vitesse %vitesseg"
    //% vitessed.min=0 vitesse.max=255
    //% vitesseg.min=0 vitesse.max=255
    //% weight=99
    export function activeLesmoteurs(directiond: LesDirections, vitessed: number, directiong: LesDirections, vitesseg: number): void {
                let allBuffer = pins.createBuffer(5);
                allBuffer[0] = LEFT_MOTOR_REGISTER;
                allBuffer[1] = directiong;
                allBuffer[2] = vitesseg;
                allBuffer[3] = directiond;
                allBuffer[4] = vitessed;
                pins.i2cWriteBuffer(ADRESSEI2C, allBuffer)
    }
    /**
     * Control motor module running
     * @param emotor Motor selection enumeration
     * @param edir   Motor direction selection enumeration
     * @param speed  Motor speed control, eg:100
     */

    //% block="activer %moteur %direction vitesse %vitesse"
    //% vitesse.min=0 vitesse.max=255
    //% weight=99
    export function active(moteur: EnumerationMoteur, direction: LesDirections, vitesse: number): void {
        switch (moteur) {
            case EnumerationMoteur.MoteurGauche:
                let leftBuffer = pins.createBuffer(3);
                leftBuffer[0] = LEFT_MOTOR_REGISTER;
                leftBuffer[1] = direction;
                leftBuffer[2] = vitesse;
                pins.i2cWriteBuffer(ADRESSEI2C, leftBuffer);
                break;
            case EnumerationMoteur.MoteurDroit:
                let rightBuffer = pins.createBuffer(3);
                rightBuffer[0] = RIGHT_MOTOR_REGISTER;
                rightBuffer[1] = direction;
                rightBuffer[2] = vitesse;
                pins.i2cWriteBuffer(ADRESSEI2C, rightBuffer);
                break;
            default:
                let allBuffer = pins.createBuffer(5);
                allBuffer[0] = LEFT_MOTOR_REGISTER;
                allBuffer[1] = direction;
                allBuffer[2] = vitesse;
                allBuffer[3] = direction;
                allBuffer[4] = vitesse;
                pins.i2cWriteBuffer(ADRESSEI2C, allBuffer)
                break;
        }
    }

    /**
     * Control the motor module to stop running
     * @param emotor Motor selection enumeration
     */

    //% block="arrêter %emotor"
    //% weight=98
    export function controlMotorStop(emotor: EnumerationMoteur): void {
        switch (emotor) {
            case EnumerationMoteur.MoteurGauche:
                let leftBuffer = pins.createBuffer(3);
                leftBuffer[0] = LEFT_MOTOR_REGISTER;
                leftBuffer[1] = 0;
                leftBuffer[2] = 0;
                pins.i2cWriteBuffer(ADRESSEI2C, leftBuffer);
                break;
            case EnumerationMoteur.MoteurDroit:
                let rightBuffer = pins.createBuffer(3);
                rightBuffer[0] = RIGHT_MOTOR_REGISTER;
                rightBuffer[1] = 0;
                rightBuffer[2] = 0;
                pins.i2cWriteBuffer(ADRESSEI2C, rightBuffer);
                break;
            default:
                let allBuffer = pins.createBuffer(5);
                allBuffer[0] = LEFT_MOTOR_REGISTER;
                allBuffer[1] = 0;
                allBuffer[2] = 0;
                allBuffer[3] = 0;
                allBuffer[4] = 0;
                pins.i2cWriteBuffer(ADRESSEI2C, allBuffer)
                break;
        }
    }




    /**
     * Control left and right LED light switch module
     * @param eled LED lamp selection
     * @param eSwitch Control LED light on or off
     */

    //% block="contrôler %eled %eSwitch"
    //% weight=97
    export function controlLED(eled: LED, eSwitch: MyEnumSwitch): void {
        switch (eled) {
            case LED.LedGauche:
                let leftLedControlBuffer = pins.createBuffer(2);
                leftLedControlBuffer[0] = LEFT_LED_REGISTER;
                leftLedControlBuffer[1] = eSwitch;
                pins.i2cWriteBuffer(ADRESSEI2C, leftLedControlBuffer);
                break;
            case LED.LedDroite:
                let rightLedControlBuffer = pins.createBuffer(2);
                rightLedControlBuffer[0] = RIGHT_LED_REGISTER;
                rightLedControlBuffer[1] = eSwitch;
                pins.i2cWriteBuffer(ADRESSEI2C, rightLedControlBuffer);
                break;
            default:
                let allLedControlBuffer = pins.createBuffer(3);
                allLedControlBuffer[0] = LEFT_LED_REGISTER;
                allLedControlBuffer[1] = eSwitch;
                allLedControlBuffer[2] = eSwitch;
                pins.i2cWriteBuffer(ADRESSEI2C, allLedControlBuffer);
                break;
        }
    }

    /**
     * Get the state of the patrol sensor
     * @param eline Select the inspection sensor enumeration
     */

    //% block="état capteur de suivi %eline"
    //% weight=96
    export function readLineSensorState(eline: MyEnumLineSensor): number {
        pins.i2cWriteNumber(ADRESSEI2C, LINE_STATE_REGISTER, NumberFormat.Int8LE);
        let data = pins.i2cReadNumber(ADRESSEI2C, NumberFormat.Int8LE)
        let state;
        switch (eline) {
            case MyEnumLineSensor.SensorL1:
                state = (data & 0x08) == 0x08 ? 1 : 0;
                break;
            case MyEnumLineSensor.SensorM:
                state = (data & 0x04) == 0x04 ? 1 : 0;
                break;
            case MyEnumLineSensor.SensorR1:
                state = (data & 0x02) == 0x02 ? 1 : 0;
                break;
            case MyEnumLineSensor.SensorL2:
                state = (data & 0x10) == 0X10 ? 1 : 0;
                break;
            default:
                state = (data & 0x01) == 0x01 ? 1 : 0;
                break;
        }
        return state;
    }

    /**
     * The ADC data of the patrol sensor is obtained
     * @param eline Select the inspection sensor enumeration
     */

    //% block="valeur capteur de suivi %eline"
    //% weight=95
    export function readLineSensorData(eline: MyEnumLineSensor): number {
        let data;
        switch (eline) {
            case MyEnumLineSensor.SensorR2:
                pins.i2cWriteNumber(ADRESSEI2C, ADC0_REGISTER, NumberFormat.Int8LE);
                let adc0Buffer = pins.i2cReadBuffer(ADRESSEI2C, 1);
                data = adc0Buffer[1] << 8 | adc0Buffer[0]
                break;
            case MyEnumLineSensor.SensorR1:
                pins.i2cWriteNumber(ADRESSEI2C, ADC1_REGISTER, NumberFormat.Int8LE);
                let adc1Buffer = pins.i2cReadBuffer(ADRESSEI2C, 2);
                data = adc1Buffer[1] << 8 | adc1Buffer[0];
                break;
            case MyEnumLineSensor.SensorM:
                pins.i2cWriteNumber(ADRESSEI2C, ADC2_REGISTER, NumberFormat.Int8LE);
                let adc2Buffer = pins.i2cReadBuffer(ADRESSEI2C, 2);
                data = adc2Buffer[1] << 8 | adc2Buffer[0];
                break;
            case MyEnumLineSensor.SensorL1:
                pins.i2cWriteNumber(ADRESSEI2C, ADC3_REGISTER, NumberFormat.Int8LE);
                let adc3Buffer = pins.i2cReadBuffer(ADRESSEI2C, 2);
                data = adc3Buffer[1] << 1 | adc3Buffer[0];
                break;
            default:
                pins.i2cWriteNumber(ADRESSEI2C, ADC4_REGISTER, NumberFormat.Int8LE);
                let adc4Buffer = pins.i2cReadBuffer(ADRESSEI2C, 2);
                data = adc4Buffer[1] << 8 | adc4Buffer[0];
                break;

        }
        return data;
    }

    /**
     * Acquiring ultrasonic data
     * @param trig trig pin selection enumeration, eg:DigitalPin.P13
     * @param echo echo pin selection enumeration, eg:DigitalPin.P14
     */

    //% block="distance en cm (pins TRIG %trig / ECHO %echo)"
    //% weight=94
    export function lireDistance(trig: DigitalPin, echo: DigitalPin): number {
        let data;
        pins.digitalWritePin(trig, 1);
        basic.pause(1);
        pins.digitalWritePin(trig, 0)
        if (pins.digitalReadPin(echo) == 0) {
            pins.digitalWritePin(trig, 0);
            pins.digitalWritePin(trig, 1);
            basic.pause(20);
            pins.digitalWritePin(trig, 0);
            data = pins.pulseIn(echo, PulseValue.High, 500 * 58);
        } else {
            pins.digitalWritePin(trig, 1);
            pins.digitalWritePin(trig, 0);
            basic.pause(20);
            pins.digitalWritePin(trig, 0);
            data = pins.pulseIn(echo, PulseValue.High, 500 * 58)
        }
        data = data / 59;
        if (data <= 0)
            return 0;
        if (data > 500)
            return 500;
        return Math.round(data);
    }

    /**
     * Getting the version number
     */

    //% block="version"
    //% weight=2
    //% advanced=true
    export function lireVersion(): string {
        let version;
        pins.i2cWriteNumber(ADRESSEI2C, VERSION_CNT_REGISTER, NumberFormat.Int8LE);
        version = pins.i2cReadNumber(ADRESSEI2C, NumberFormat.Int8LE);
        pins.i2cWriteNumber(ADRESSEI2C, VERSION_DATA_REGISTER, NumberFormat.Int8LE);
        version = pins.i2cReadBuffer(ADRESSEI2C, version);
        let versionString = version.toString();
        return versionString
    }



    /** 
    * Set the three primary color:red, green, and blue
    * @param r  , eg: 100
    * @param g  , eg: 100
    * @param b  , eg: 100
    */

    //% weight=60
    //% r.min=0 r.max=255
    //% g.min=0 g.max=255
    //% b.min=0 b.max=255
    //% block="rouge|%r vert|%g bleu|%b"
    export function rgb(r: number, g: number, b: number): number {
        return (r << 16) + (g << 8) + (b);
    }

    /**
     * The LED positions where you wish to begin and end
     * @param from  , eg: 1
     * @param to  , eg: 4
     */

    //% weight=60
    //% from.min=0 from.max=3
    //% to.min=1 to.max=4
    //% block="ensemble de LEDs RGB de|%from à|%to"
    export function ledRange(from: number, to: number): number {
        return ((from) << 16) + (2 << 8) + (to);
    }

    /**
     * Set the color of the specified LEDs
     * @param index  , eg: 1
     */

    //% weight=60
    //% index.min=0 index.max=3
    //% block="allumer LED RGB |%index avec couleur |%rgb"
    export function setIndexColor(index: number, rgb: NeoPixelColors) {
        let f = index;
        let t = index;
        let r = (rgb >> 16) * (_brightness / 255);
        let g = ((rgb >> 8) & 0xFF) * (_brightness / 255);
        let b = ((rgb) & 0xFF) * (_brightness / 255);

        if (index > 15) {
            if (((index >> 8) & 0xFF) == 0x02) {
                f = index >> 16;
                t = index & 0xff;
            } else {
                f = 0;
                t = -1;
            }
        }
        for (let i = f; i <= t; i++) {
            neopixel_buf[i * 3 + 0] = Math.round(g)
            neopixel_buf[i * 3 + 1] = Math.round(r)
            neopixel_buf[i * 3 + 2] = Math.round(b)
        }
        ws2812b.sendBuffer(neopixel_buf, DigitalPin.P15)

    }

    /**
     * Set the color of all RGB LEDs
     */

    //% weight=60
    //% block="allumer toutes les LEDs RGB avec |%rgb"
    export function showColor(rgb: NeoPixelColors) {
        let r = (rgb >> 16) * (_brightness / 255);
        let g = ((rgb >> 8) & 0xFF) * (_brightness / 255);
        let b = ((rgb) & 0xFF) * (_brightness / 255);
        for (let i = 0; i < 16 * 3; i++) {
            if ((i % 3) == 0)
                neopixel_buf[i] = Math.round(g)
            if ((i % 3) == 1)
                neopixel_buf[i] = Math.round(r)
            if ((i % 3) == 2)
                neopixel_buf[i] = Math.round(b)
        }
        ws2812b.sendBuffer(neopixel_buf, DigitalPin.P15)
    }

    /**
     * Set the brightness of RGB LED
     * @param brightness  , eg: 100
     */

    //% weight=70
    //% brightness.min=0 brightness.max=255
    //% block="définir luminosité des LEDs RGB à |%brightness"
    export function setBrightness(brightness: number) {
        _brightness = brightness;
    }

    /**
     * Turn off all RGB LEDs
     */

    //% weight=40
    //% block="éteindre LEDs RGB"
    export function ledBlank() {
        showColor(0)
    }

    /**
     * RGB LEDs display rainbow colors 
     */

    //% weight=50
    //% startHue.defl=1
    //% endHue.defl=360
    //% startHue.min=0 startHue.max=360
    //% endHue.min=0 endHue.max=360
    //% blockId=led_rainbow block="afficher arc en ciel sur LEDs RGB de|%startHue à|%endHue"
    export function ledRainbow(startHue: number, endHue: number) {
        startHue = startHue >> 0;
        endHue = endHue >> 0;
        const saturation = 100;
        const luminance = 50;
        let steps = 3 + 1;
        const direction = HueInterpolationDirection.Clockwise;

        //hue
        const h1 = startHue;
        const h2 = endHue;
        const hDistCW = ((h2 + 360) - h1) % 360;
        const hStepCW = Math.idiv((hDistCW * 100), steps);
        const hDistCCW = ((h1 + 360) - h2) % 360;
        const hStepCCW = Math.idiv(-(hDistCCW * 100), steps);
        let hStep: number;
        if (direction === HueInterpolationDirection.Clockwise) {
            hStep = hStepCW;
        } else if (direction === HueInterpolationDirection.CounterClockwise) {
            hStep = hStepCCW;
        } else {
            hStep = hDistCW < hDistCCW ? hStepCW : hStepCCW;
        }
        const h1_100 = h1 * 100; //we multiply by 100 so we keep more accurate results while doing interpolation

        //sat
        const s1 = saturation;
        const s2 = saturation;
        const sDist = s2 - s1;
        const sStep = Math.idiv(sDist, steps);
        const s1_100 = s1 * 100;

        //lum
        const l1 = luminance;
        const l2 = luminance;
        const lDist = l2 - l1;
        const lStep = Math.idiv(lDist, steps);
        const l1_100 = l1 * 100

        //interpolate
        if (steps === 1) {
            writeBuff(0, hsl(h1 + hStep, s1 + sStep, l1 + lStep))
        } else {
            writeBuff(0, hsl(startHue, saturation, luminance));
            for (let i = 1; i < steps - 1; i++) {
                const h = Math.idiv((h1_100 + i * hStep), 100) + 360;
                const s = Math.idiv((s1_100 + i * sStep), 100);
                const l = Math.idiv((l1_100 + i * lStep), 100);
                writeBuff(0 + i, hsl(h, s, l));
            }
            writeBuff(3, hsl(endHue, saturation, luminance));
        }
        ws2812b.sendBuffer(neopixel_buf, DigitalPin.P15)
    }

    export enum HueInterpolationDirection {
        Clockwise,
        CounterClockwise,
        Shortest
    }

    function writeBuff(index: number, rgb: number) {
        let r = (rgb >> 16) * (_brightness / 255);
        let g = ((rgb >> 8) & 0xFF) * (_brightness / 255);
        let b = ((rgb) & 0xFF) * (_brightness / 255);
        neopixel_buf[index * 3 + 0] = Math.round(g)
        neopixel_buf[index * 3 + 1] = Math.round(r)
        neopixel_buf[index * 3 + 2] = Math.round(b)
    }

    function hsl(h: number, s: number, l: number): number {
        h = Math.round(h);
        s = Math.round(s);
        l = Math.round(l);

        h = h % 360;
        s = Math.clamp(0, 99, s);
        l = Math.clamp(0, 99, l);
        let c = Math.idiv((((100 - Math.abs(2 * l - 100)) * s) << 8), 10000); //chroma, [0,255]
        let h1 = Math.idiv(h, 60);//[0,6]
        let h2 = Math.idiv((h - h1 * 60) * 256, 60);//[0,255]
        let temp = Math.abs((((h1 % 2) << 8) + h2) - 256);
        let x = (c * (256 - (temp))) >> 8;//[0,255], second largest component of this color
        let r$: number;
        let g$: number;
        let b$: number;
        if (h1 == 0) {
            r$ = c; g$ = x; b$ = 0;
        } else if (h1 == 1) {
            r$ = x; g$ = c; b$ = 0;
        } else if (h1 == 2) {
            r$ = 0; g$ = c; b$ = x;
        } else if (h1 == 3) {
            r$ = 0; g$ = x; b$ = c;
        } else if (h1 == 4) {
            r$ = x; g$ = 0; b$ = c;
        } else if (h1 == 5) {
            r$ = c; g$ = 0; b$ = x;
        }
        let m = Math.idiv((Math.idiv((l * 2 << 8), 100) - c), 2);
        let r = r$ + m;
        let g = g$ + m;
        let b = b$ + m;

        return (r << 16) + (g << 8) + b;
    }
}



