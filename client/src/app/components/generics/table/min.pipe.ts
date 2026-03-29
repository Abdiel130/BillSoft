import { Pipe, PipeTransform } from '@angular/core';

/** Returns the minimum of an array of numbers. Used for pagination display. */
@Pipe({ name: 'min', standalone: true, pure: true })
export class MinPipe implements PipeTransform {
  transform(values: number[]): number {
    return Math.min(...values);
  }
}
