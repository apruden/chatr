import { Pipe, PipeTransform } from '@angular/core'

const now = new Date().getFullYear() * 100 + new Date().getMonth()

@Pipe({
  name: 'age',
})
export class AgePipe implements PipeTransform {
  transform(value: number, ...args: any[]): number {
    return Math.floor(now - value)
  }
}
