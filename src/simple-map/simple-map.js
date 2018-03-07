/**
 * BLOCK: tiwit-map-blocks-bundle
 *
 * Registering a basic block with Gutenberg.
 * Simple block, renders and saves the same content without any interactivity.
 */

//  Import CSS.
import './style.scss'
import './editor.scss'

const { Component } = wp.element

const { __ } = wp.i18n; // Import __() from wp.i18n

const {
	registerBlockType,
	InspectorControls,
} = wp.blocks

const {
	TextControl,
	Button,
	Notice,
} = wp.components


class TiwitSimpleMap extends Component {

	constructor() {
		super( ...arguments );

		this.changeUserAddress = this.changeUserAddress.bind( this );
		this.getLatLongFromAddress = this.getLatLongFromAddress.bind( this );

		this.state = {
			map : null,
			isWaitingForNominatim : false,
			nominatimReturnEmpty : false
		}
	}

	componentDidMount(){

		const { lat, lon } = this.props.attributes

		let defaultAttributes = {};

		if( ! lat ){
			defaultAttributes.lat = "47.2161494"
		}
		if( ! lon ){
			defaultAttributes.lon = "-1.5335951"
		}

		if( defaultAttributes ){
			this.props.setAttributes( defaultAttributes )
		}

	}


	componentDidUpdate( prevProps ) {

		if( this.props.attributes.lat &&
			(
				this.props.attributes.lat !== prevProps.attributes.lat ||
				this.props.attributes.lon !== prevProps.attributes.lon
			)
		){

			this.displayMap();

		}
	}


	displayMap(){

		const { map } = this.state
		const { lat, lon } = this.props.attributes
		const latLongObj = [ parseFloat( lat ), parseFloat( lon )]


		if( ! map ){

			const newMap = L.map( this.props.id, {
				center: latLongObj,
				zoom: 13
			});
			L.tileLayer('http://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png').addTo( newMap );

			L.marker( latLongObj ).addTo( newMap );

			this.setState( {
				map: newMap
			} );
		} else {

			// delete every Marker on the map
			map.eachLayer( function ( layer ) {
				if(layer instanceof L.Marker){
					layer.removeFrom( map )
				}
			})

			// Cet the center of the map and the new Marker
			map.setView( latLongObj )
			L.marker( latLongObj ).addTo( map );
		}

	}


	changeUserAddress( address ){

		this.props.setAttributes( {
			address: address
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
		const { id, className, attributes, focus } = this.props
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
								{__('Add marker on map')}
							</Button>
							{ nominatimReturnEmpty && <Notice
									status="error"
									isDismissible={false}
									content={__('Error while searching the address, please verify and try again')}
								/>
							}
						</div>
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
