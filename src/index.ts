import {Command, flags} from '@oclif/command'
import * as fs from 'fs'
import * as http from 'http'
import * as path from 'path'
import * as QRCode from 'qrcode'
const ip = require('ip').address()

// const crypto = require('crypto')
// const fs = require('fs')

// class termqr extends Command {
//   static description = 'describe the command here'

//   static examples = [
//     `$ termqr
// hello world from ./src/termqr.ts!
// `,
//   ]

//   static flags = {
//     // add --version flag to show CLI version
//     version: flags.version({char: 'v'}),
//     // add --help flag to show CLI version
//     help: flags.help({char: 'h'}),

//     // flag with a value (-n, --name=VALUE)
//     name: flags.string({char: 'n', description: 'name to print'}),
//     force: flags.boolean({char: 'f'}),
//   }

//   static args = [{name: 'file'}]

//   async run() {
//     const {args, flags} = this.parse(termqr)

//     const name = flags.name || 'world'
//     this.log(`hello ${name} from ${__filename}!`)
//     if (args.file && flags.force) {
//       this.log(`you input --force and --file: ${args.file}`)
//     }
//   }
// }

const stringQR = (string: string) => {
  return new Promise((resolve, reject) => {
    QRCode.toString(string, function (err: Error, string: string) {
      if (err) {
        reject(err)
        return
      }

      resolve(string)
    })
  })
}

const startServer = (options: any = {}) => {
  return new Promise(() => {
    const handler = function (req: any, res: any) {
      // res.writeHead(200, {'Content-Type': 'text/plain'})
      // res.end('Hello World\n')
      res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename=' + options.file
      })
      const readStream = fs.createReadStream(options.filePath)
      readStream.pipe(res)
    }

    const server = http.createServer()
    server.addListener('request', handler)
    server.listen(options.port)

  })
}

const checkFile = (file: string) => {
  const rt: any = {}
  const filePath = path.join(path.resolve('./'), file)

  const exists = fs.existsSync(filePath)
  if (!exists) {
    rt.error = 'File does not exists'
  }

  if (!rt.error) {
    // console.log(fs.statSync(filePath))
  }

  rt.filePath = filePath
  return rt
}

class termqr extends Command {
  static args = [{name: 'file'}]

  async run() {
    const {args} = this.parse(termqr)
    const {file} = args

    const port = 8899
    // const my_ip = ip.address()
    const url = `http://${ip}:${port}`

    const {meta, error, filePath} = checkFile(file)
    if (error) {
      this.error(error)
      return
    }

    this.log(meta)

    // this.log(`Serving ${file} at ${url}`)

    const qrCode = await stringQR(url)
    this.log(qrCode)

    await startServer({
      indexFile: file,
      host: ip,
      port,
      file,
      filePath
    })
  }
}

export = termqr
