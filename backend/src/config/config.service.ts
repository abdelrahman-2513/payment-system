import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
    constructor(private configSVC: NestConfigService) { }


    get<T = string>(key: string, defaultValue?: string | number | null) {
        const value = this.configSVC.get(key);
        return value !== null && value !== undefined ? value : defaultValue;
    }

    // Database configuration (PostgreSQL)
    get database() {
        return {
            host: this.get('DB_SERVER', 'localhost'),
            port: parseInt(this.get('DB_PORT', '5432')),
            username: this.get('DB_USER', 'postgres'),
            password: this.get('DB_PASSWORD', 'admin'),
            database: this.get('DB_NAME', 'payment-test'),
        };
    }

    // JWT configuration
    get jwt() {
        return {
            secret: this.get('JWT_KEY', 'YourSuperSecretJWTKeyThatIsAtLeast32CharactersLong!'),
            issuer: this.get('JWT_ISSUER', 'Cyshield'),
            audience: this.get('JWT_AUDIENCE', 'CyshieldUsers'),
            expiresIn: this.get('JWT_EXPIRE_MINUTES', '60') + 'm',
        };
    }

    // CORS configuration
    get cors() {
        return {
            whitelist: this.get('WHITELIST', 'http://localhost:4200'),
        };
    }

    // Tamara Payment Gateway configuration
    get tamara() {
        return {
            apiUrl: this.get('TAMARA_API_URL', 'https://api-sandbox.tamara.co'),
            apiToken: this.get('TAMARA_API_TOKEN', ''),
            notificationToken: this.get('TAMARA_NOTIFICATION_TOKEN', ''),
            publicKey: this.get('TAMARA_PUBLIC_KEY', ''),
        };
    }

    // Security configuration
    get security() {
        return {
            bcryptRounds: parseInt(this.get('BCRYPT_ROUNDS', '10')),
            sessionSecret: this.get('SESSION_SECRET', 'YourSuperSecretSessionKeyThatIsAtLeast32CharactersLong!'),
        };
    }

    // Application configuration
    get app() {
        return {
            port: parseInt(this.get('PORT', '3000')),
            nodeEnv: this.get('NODE_ENV', 'development'),
        };
    }

    // Rate limiting configuration
    get throttling() {
        return {
            shortTtl: parseInt(this.get('THROTTLE_SHORT_TTL', '1000')), 
            shortLimit: parseInt(this.get('THROTTLE_SHORT_LIMIT', '3')), 
            mediumTtl: parseInt(this.get('THROTTLE_MEDIUM_TTL', '10000')),
            mediumLimit: parseInt(this.get('THROTTLE_MEDIUM_LIMIT', '20')),
            longTtl: parseInt(this.get('THROTTLE_LONG_TTL', '60000')),
            longLimit: parseInt(this.get('THROTTLE_LONG_LIMIT', '100')),
        };
    }
}
