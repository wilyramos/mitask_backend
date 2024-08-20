import { transporter } from "../config/nodemailer"
 
interface IEmail {
    email: string
    name: string
    token: string
}

export class AuthEmail {
    static sendConfirmationEmail = async ( user : IEmail) => {
        await transporter.sendMail({
            from: 'UpTask <admin@mitask.com>',
            to: user.email,
            subject: 'Confirma tu cuenta - Mitask',
            text: `Para confirmar tu cuenta haz click en el siguiente enlace:`,
            html: `<p>Hola ${user.name},</p>
            <p>Para confirmar tu cuenta haz click en el siguiente enlace:</p>
            <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirmar cuenta</a>
            <p> E ingresando el siguiente código: ${user.token}</p>
            <p> Este token expira en 15 minutos</p>
            <p>Si no has solicitado este correo, por favor ignóralo.</p>
            `
        })
    }
    static sendPasswordResetToken = async ( user : IEmail) => {
        await transporter.sendMail({
            from: 'MiTask <admin@mitask.com>',
            to: user.email,
            subject: 'Reestablecer tu cuenta - Mitask',
            text: `Mi task - Reestablecer contraseña`,

            html: `<p>Hola ${user.name},</p>
            <p>Para reestablecer tu cuenta haz click en el siguiente enlace:</p>
            <a href="${process.env.FRONTEND_URL}/auth/new-password">Reestablecer contraseña</a>
            <p> E ingresando el siguiente código: ${user.token}</p>
            <p> Este token expira en 15 minutos</p>
            <p>Si no has solicitado este correo, por favor ignóralo.</p>
            `
        })
    }
}