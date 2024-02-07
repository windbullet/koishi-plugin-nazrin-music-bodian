import { Context, Schema } from 'koishi'
import {} from'koishi-plugin-nazrin-core'

export const name = 'nazrin-music-bodian'

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

export const using = ['nazrin']

export function apply(ctx: Context) {
  const thisPlatform = 'bodian'
  ctx.nazrin.music.push(thisPlatform)

  ctx.on("nazrin/music", async (ctx, keyword) => {
    let result = await ctx.http.get(`https://api.xingzhige.com/API/Kuwo_BD_new/?name=${encodeURIComponent(keyword)}`)
    let findList = []
    if (result.code !== 0) {
      findList = [
        {
          err: true,
          platform: thisPlatform,
        }
      ]
    } else {
      for (let i = 0; i < result.data.length; i++) {
        findList.push({
          name: result.data[i].songname,
          author: result.data[i].name,
          cover: result.data[i].cover,
          url: undefined,
          platform: thisPlatform,
          data: {name: keyword, n: i+1},
          err: false,
        })
      }
    }

    ctx.emit('nazrin/search_over', findList)
  })

  ctx.on("nazrin/parse_music", async (ctx, platform, url, data) => {
    if (platform !== thisPlatform) return

    let result = await ctx.http.get(`https://api.xingzhige.com/API/Kuwo_BD_new/?name=${encodeURIComponent(data.name)}&n=${data.n}`)
    if (result.code !== 0) {
      ctx.emit('nazrin/parse_error', result.msg)
    } else {
      let {data: songdata} = result
      let second = (+songdata.interval.slice(0, songdata.interval.lastIndexOf("分")) * 60) + songdata.interval.slice(songdata.interval.lastIndexOf("分") + 1, songdata.interval.lastIndexOf("秒"))
      ctx.emit('nazrin/parse_over', 
        songdata.src,
        songdata.songname,
        songdata.name,
        songdata.cover,
        second,
        +songdata.kbps.slice(0, songdata.kbps.lastIndexOf("kbps")),
      )
    }
    
  })
}
