/**
 * BLOCK: tiwit-map-blocks-bundle
 *
 * Registering a basic block with Gutenberg.
 * Simple block, renders and saves the same content without any interactivity.
 */

//  Import CSS.
import './style.scss'
import './editor.scss'

import L from 'leaflet';

const { Component } = wp.element

const { __ } = wp.i18n; // Import __() from wp.i18n

const {
	registerBlockType,
	InspectorControls,
} = wp.blocks

const {
	TextControl,
	TextareaControl,
	RangeControl,
	Button,
	Notice,
} = wp.components


class TiwitSimpleMap extends Component {

	constructor() {
		super( ...arguments );

		this.changeUserAddress = this.changeUserAddress.bind( this );
		this.getLatLongFromAddress = this.getLatLongFromAddress.bind( this );
		this.changePopupContent = this.changePopupContent.bind( this );

		this.state = {
			map : null,
			isWaitingForNominatim : false,
			nominatimReturnEmpty : false
		}
	}

	componentDidMount(){

		this.displayMap()

	}


	componentDidUpdate( prevProps ) {

		if( this.props.attributes.lat &&
			(
				this.props.attributes.lat !== prevProps.attributes.lat ||
				this.props.attributes.lon !== prevProps.attributes.lon ||
				this.props.attributes.popup !== prevProps.attributes.popup ||
				this.props.attributes.zoom !== prevProps.attributes.zoom
			)
		){

			this.displayMap();

		}
	}


	displayMap(){

		let { map } = this.state
		const { lat, lon, popup, zoom } = this.props.attributes

		const realZoom = zoom ? zoom : 13
		if( ! map ){

			map = L.map( this.props.id, {
				center: [ 47.2161494, -1.5335951 ],
				zoom: realZoom
			});
			L.tileLayer('http://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png').addTo( map );


			this.setState( {
				map: map
			} );
		} else {

			// delete every Marker on the map
			map.eachLayer( function ( layer ) {
				if(layer instanceof L.Marker){
					layer.removeFrom( map )
				}
			})

		}

		if( lat && lon ){
			const latLongObj = [ parseFloat( lat ), parseFloat( lon )]

			// Cet the center of the map and the new Marker
			map.setView( latLongObj )
			map.setZoom( realZoom )

			// Add marker
			const marker =L.marker( latLongObj ).addTo( map );

			// Add popup
			if( popup ){
				marker.bindPopup(popup).openPopup();
			}
		}

	}


	changeUserAddress( address ){

		this.props.setAttributes( {
			address: address
		} );
	}

	changePopupContent( content ){

		this.props.setAttributes( {
			popup: content
		} );
	}

	getLatLongFromAddress(){
		const { attributes, setAttributes}  = this.props;
		const address = attributes.address;

		this.setState({
			isWaitingForNominatim : true
		})
		fetch( 'https://nominatim.openstreetmap.org/search?limit=1&format=json&q=' + encodeURIComponent( address ) )
			.then(function(response) {
				return response.json();
			})
			.then(function( jsonResponse) {

				// set lat long attributes
				if( jsonResponse.length > 0 && jsonResponse[0].lat ){

					setAttributes( {
						lat: jsonResponse[0].lat,
						lon: jsonResponse[0].lon
					} );

					this.setState({
						isWaitingForNominatim : false,
						nominatimReturnEmpty : false
					})
				} else {
					this.setState({
						isWaitingForNominatim : false,
						nominatimReturnEmpty : true
					})
				}

			}.bind( this ))
	}

	render(){
		const { id, className, attributes, focus, setAttributes } = this.props
		const { isWaitingForNominatim, nominatimReturnEmpty } = this.state

		return(
			<div className={className}>
				{ focus &&
					<InspectorControls key="inspector">
						<h2>{ __( 'Comparison Settings' ) }</h2>
						<TextControl
							label={ __( 'Address' ) }
							value={ attributes.address }
							onChange={ this.changeUserAddress }
						/>
						<div className="blocks-base-control">
							<Button
								onClick={ this.getLatLongFromAddress }
								isLarge
								isBusy={ isWaitingForNominatim }
								>
								{ attributes.lat ? __('Change marker position') : __('Add marker on map') }
							</Button>
							{ nominatimReturnEmpty && <Notice
									status="error"
									isDismissible={false}
									content={__('Error while searching the address, please verify and try again')}
								/>
							}
						</div>
						{ attributes.lat && <TextareaControl
								label={__('Popup content')}
								value={attributes.popup}
								onChange={this.changePopupContent}
							/>
						}
						<RangeControl
							label={__('Zoom')}
							value={ attributes.zoom ? attributes.zoom : 13 }
							onChange={ ( zoom ) => setAttributes( { zoom: zoom }) }
							min={ 1 }
							max={ 20 }
						/>


					</InspectorControls>
				}
				<div id={id} style={{ height : '500px'}}/>
			</div>
		)
	}
}
/**
 * Register: aa Gutenberg Block.
 *
 * Registers a new block provided a unique name and an object defining its
 * behavior. Once registered, the block is made editor as an option to any
 * editor interface where blocks are implemented.
 *
 * @link https://wordpress.org/gutenberg/handbook/block-api/
 * @param  {string}   name     Block name.
 * @param  {Object}   settings Block settings.
 * @return {?WPBlock}          The block, if it has been successfully
 *                             registered; otherwise `undefined`.
 */
registerBlockType( 'tiwit-map-blocks-bundle/simple-map', {
	// Block name. Block names must be string that contains a namespace prefix. Example: my-plugin/my-custom-block.
	title: __( 'Simple map' ), // Block title.
	icon: 'location-alt', // Block icon from Dashicons → https://developer.wordpress.org/resource/dashicons/.
	category: 'common', // Block category — Group blocks together based on common traits E.g. common, formatting, layout widgets, embed.
	keywords: [
		__( 'tiwit' ),
		__( 'location' ),
	],
	supports: {
		html: false
	},
	attributes: {
		address: {
			type: 'string',
		},
		lat: {
			type: 'string',
		},
		lon: {
			type: 'string',
		},
		popup:{
			type: 'string'
		},
		zoom:{
			type: 'string'
		}
	},

	/**
	 * The edit function describes the structure of your block in the context of the editor.
	 * This represents what the editor will render when the block is used.
	 *
	 * The "edit" property must be a valid function.
	 *
	 * @link https://wordpress.org/gutenberg/handbook/block-api/block-edit-save/
	 */
	edit: TiwitSimpleMap,

	/**
	 * The save function defines the way in which the different attributes should be combined
	 * into the final markup, which is then serialized by Gutenberg into post_content.
	 *
	 * The "save" property must be specified and must be a valid function.
	 *
	 * @link https://wordpress.org/gutenberg/handbook/block-api/block-edit-save/
	 */
	save: function( props ) {
		return (
			<div className={ props.className }>
				<p>Soon a map</p>
			</div>
		);
	},
} );
