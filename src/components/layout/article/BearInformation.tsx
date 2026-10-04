import React from 'react';
import { Highlight } from '../../features/Highlight.js';

export function BearInformation(): React.JSX.Element {
  return (
    <Highlight>
      <section className="bear-information">
        <h3>Types of bear</h3>

        <table>
          <thead>
            <tr>
              <th>Bear Type</th>
              <th>Coat</th>
              <th>Adult size</th>
              <th>Habitat</th>
              <th>Lifespan</th>
              <th>Diet</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Wild</td>
              <td>Brown or black</td>
              <td>1.4 to 2.8 meters</td>
              <td>Woods and forests</td>
              <td>25 to 28 years</td>
              <td>Fish, meat, plants</td>
            </tr>

            <tr>
              <td>Urban</td>
              <td>North Face</td>
              <td>18 to 22</td>
              <td>Condos and coffee shops</td>
              <td>20 to 32 years</td>
              <td>Starbucks, sushi</td>
            </tr>
          </tbody>
        </table>

        <h3>Habitats and Eating habits</h3>

        <p>
          Wild bears eat a variety of meat, fish, fruit, nuts, and other
          naturally growing ingredients...
        </p>

        <img src="../../../../media/wild-bear.jpg" alt="Wild bear in forest" />

        <p>
          Urban (gentrified) bears on the other hand have largely abandoned the
          old ways...
        </p>

        <img
          src="../../../../media/urban-bear.jpg"
          alt="Urban bear near buildings"
        />

        <h3>Mating rituals</h3>

        <p>Bears are romantic creatures by nature...</p>

        <figure>
          <audio controls>
            <source src="../../../../media/bear.mp3" type="audio/mp3" />
            <source src="../../../../media/bear.ogg" type="audio/ogg" />

            <p>
              It looks like your browser doesn't support HTML5 audio players.
            </p>
          </audio>
        </figure>
      </section>
    </Highlight>
  );
}
